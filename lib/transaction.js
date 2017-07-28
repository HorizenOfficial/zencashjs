var bs58check = require('bs58check');
var secp256k1 = require('secp256k1');
var int64buffer = require('int64-buffer');
var zconfig = require('./config');
var zcrypto = require('./crypto');
var zutils = require('./utils');
var zopcodes = require('./opcodes');

/* SIGHASH Codes
 * Obtained from: https://github.com/ZencashOfficial/zen/blob/master/src/script/interpreter.h
 */
const SIGHASH_ALL = 1;
const SIGHASH_NONE = 2;
const SIGHASH_SINGLE = 3;
const SIGHASH_ANYONECANPAY = 0x80;

/*
 * Object types
 */
// TXOBJ Structure


// HISTORY Structure


// RECIPIENTS Structure


// https://github.com/bitcoinjs/bitcoinjs-lib/issues/14
function numToBytes(num, bytes) {
  if (bytes == 0) return [];else return [num % 256].concat(numToBytes(Math.floor(num / 256), bytes - 1));
}
function numToVarInt(num) {
  var b;
  if (num < 253) b = [num];else if (num < 65536) b = [253].concat(numToBytes(num, 2));else if (num < 4294967296) b = [254].concat(numToBytes(num, 4));else b = [253].concat(numToBytes(num, 8));
  return Buffer.from(b).toString('hex');
}

/*
 * Given a hex string, get the length of it in bytes
 * ** NOT string.length, but convert it into bytes
 *    and return the length of that in bytes in hex
 * @param {String} hexStr
 * return {String} Length of hexStr in bytes
 */
function getStringBufferLength(hexStr) {
  const _tmpBuf = Buffer.from(hexStr, 'hex').length;
  return Buffer.from([_tmpBuf]).toString('hex');
}

/* More info: https://github.com/ZencashOfficial/zen/blob/master/src/script/standard.cpp#L377
 * Given an address, generates a pubkeyhash type script needed for the transaction
 * @param {String} address
 * return {String} pubKeyScript
 */
function mkPubkeyHashScript(address) {
  var addrHex = bs58check.decode(address).toString('hex');

  // Cut out the first 4 bytes (pubKeyHash)
  var subAddrHex = addrHex.substring(4, addrHex.length);

  return zopcodes.OP_DUP + zopcodes.OP_HASH160 + getStringBufferLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUALVERIFY + zopcodes.OP_CHECKSIG;
}

/* More info: https://github.com/ZencashOfficial/zen/blob/master/src/script/standard.cpp#L377
 * Given an address, generates a pubkeyhash type script needed for the transaction
 * @param {String} address
 * return {String} pubKeyScript
 */
function mkPubkeyHashReplayScript(address) {
  var addrHex = bs58check.decode(address).toString('hex');

  // Cut out the first 4 bytes (pubKeyHash)
  var subAddrHex = addrHex.substring(4, addrHex.length);

  // TODO: change this so it gets block hash and height via REST API
  var blockHeight = 142091;

  var blockHeightBuffer = Buffer.alloc(4);
  blockHeightBuffer.writeUInt32LE(blockHeight, 0);
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3);
  }
  var blockHeightHex = blockHeightBuffer.toString('hex');

  // Need to reverse it
  var blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052';
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');

  // '14' is the length of the subAddrHex (in bytes)
  return zopcodes.OP_DUP + zopcodes.OP_HASH160 + getStringBufferLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUALVERIFY + zopcodes.OP_CHECKSIG + getStringBufferLength(blockHashHex) + blockHashHex + getStringBufferLength(blockHeightHex) + blockHeightHex + zopcodes.OP_CHECKBLOCKATHEIGHT;
}

/*
 * Given an address, generates a script hash type script needed for the transaction
 * @param {String} address
 * return {String} scriptHash script
 */
function mkScriptHashScript(address) {
  var addrHex = bs58check.decode(address).toString('hex');
  var subAddrHex = addrHex.substring(4, addrHex.length); // Cut out the '00' (we also only want 14 bytes instead of 16)

  // TODO: change this so it gets block hash and height via REST API
  var blockHeight = 142091;

  var blockHeightBuffer = Buffer.alloc(4);
  blockHeightBuffer.writeUInt32LE(blockHeight, 0);
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3);
  }
  var blockHeightHex = blockHeightBuffer.toString('hex');

  // Need to reverse it
  var blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052';
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');

  // '14' is the length of the subAddrHex (in bytes)
  return zopcodes.OP_HASH160 + '14' + subAddrHex + zopcodes.OP_EQUAL + getStringBufferLength(blockHashHex) + blockHashHex + getStringBufferLength(blockHeightHex) + blockHeightHex + zopcodes.OP_CHECKBLOCKATHEIGHT;
}

/*
 * Given an address, generates an output script
 * @param {String} address
 * return {String} output script
 */
function addressToScript(address) {
  // P2SH starts with a 3 or 2
  if (address[1] === 's' || address[0] === 't') {
    return mkScriptHashScript(address);
  }

  // P2PKH-replay is a replacement for P2PKH
  // P2PKH-replay starts with a 0
  return mkPubkeyHashReplayScript(address);
}

/*
 * Signature hashing for TXOBJ
 * @param {String} address
 * return {String} output script
 */
function signatureForm(txObj, i, script, hashcode) {
  // Copy object so we don't rewrite it
  var newTx = JSON.parse(JSON.stringify(txObj));

  for (var j = 0; j < newTx.ins.length; j++) {
    newTx.ins[j].script = '';
  }
  newTx.ins[i].script = script;

  if (hashcode === SIGHASH_NONE) {
    newTx.outs = [];
  } else if (hashcode === SIGHASH_SINGLE) {
    newTx.outs = newTx.outs.slice(0, newTx.ins.length);
    for (var j = 0; j < newTx.ins.length - 1; ++j) {
      newTx.outs[j].satoshis = Math.pow(2, 64) - 1;
      newTx.outs[j].script = '';
    }
  } else if (hashcode === SIGHASH_ANYONECANPAY) {
    newTx.ins = [newTx.ins[i]];
  }

  return newTx;
}

/*
 * Serializes a TXOBJ into hex string
 * @param {Object} txObj
 * return {String} output script
 */
function serializeTx(txObj) {
  var serializedTx = '';
  var _buf16 = Buffer.alloc(4);

  // Version
  _buf16.writeUInt16LE(txObj.version, 0);
  serializedTx += _buf16.toString('hex');

  // History
  serializedTx += numToVarInt(txObj.ins.length);
  txObj.ins.map(function (i) {
    // Txids and vouts
    _buf16.writeUInt16LE(i.output.vout, 0);
    serializedTx += Buffer.from(i.output.hash, 'hex').reverse().toString('hex');
    serializedTx += _buf16.toString('hex');

    // Script
    serializedTx += getStringBufferLength(i.script);
    serializedTx += i.script;

    // Sequence
    serializedTx += i.sequence;
  });

  // Outputs
  serializedTx += numToVarInt(txObj.outs.length);
  txObj.outs.map(function (o) {
    // Write 64bit buffers
    // JS only supports 56 bit
    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/bufferutils.js#L25
    var _buf32 = Buffer.alloc(8);

    _buf32.writeInt32LE(o.satoshis & -1, 0);
    _buf32.writeUInt32LE(Math.floor(o.satoshis / 0x100000000), 4);

    serializedTx += _buf32.toString('hex');
    serializedTx += getStringBufferLength(o.script);
    serializedTx += o.script;
  });

  // Locktime
  _buf16.writeUInt16LE(txObj.locktime, 0);
  serializedTx += _buf16.toString('hex');

  return serializedTx;
}

/*
 * Creates a raw transaction
 * @param {[object]} history, array of history in the format: [{txid: 'transaction_id', vout: vout, value: value (insatoshi), address: txout address}]
 * @param {[object]} output address on where to send coins to [{value}]
 * @param {Int} Amount of zencash to send (in satoshis)
 * @return {TXOBJ} Transction Object (see types.js for info about structure)
 */
function createRawTx(history, recipients) {
  var txObj = { locktime: 0, version: 1, ins: [], outs: [] };

  txObj.ins = history.map(function (h) {
    return {
      output: { hash: h.txid, vout: h.vout },
      script: '',
      sequence: 'ffffffff'
    };
  });
  txObj.outs = recipients.map(function (o) {
    return { script: addressToScript(o.address), satoshis: o.satoshis };
  });

  return txObj;
}

/*
 * Signs the raw transaction
 * @param {String} rawTx raw transaction
 * @param {Int} i
 * @param {privKey} privKey (not WIF format)
 * @param {hashcode} hashcode
 * return {String} signed transaction
 */
function signTx(_txObj, i, privKey, hashcode) {
  if (hashcode === undefined) {
    hashcode = SIGHASH_ALL;
  }
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj));

  // Buffer
  var _buf16 = Buffer.alloc(4);
  _buf16.writeUInt16LE(hashcode, 0);

  // Prepare signing
  const pubKey = zutils.privKeyToPubKey(privKey);
  const address = zutils.pubKeyToAddr(pubKey);
  const script = addressToScript(address);

  // Prepare our signature
  const signingTx = signatureForm(txObj, i, script, hashcode);
  const signingTxHex = serializeTx(signingTx); // Convert to hex string
  const signingTxWithHashcode = signingTxHex + _buf16.toString('hex');
  const msg = zcrypto.sha256x2(Buffer.from(signingTxWithHashcode, 'hex'));
  const rawsig = secp256k1.sign(Buffer.from(msg, 'hex'), Buffer.from(privKey, 'hex')).signature.toString('hex');

  // Encode signature
  var b1 = rawsig.substr(0, 64);
  var b2 = rawsig.substr(64, 128);

  if ('89abcdef'.indexOf(b1[0]) != -1) {
    b1 = '00' + b1;
  }
  if ('89abcdef'.indexOf(b2[0]) != -1) {
    b2 = '00' + b2;
  }

  // http://www.righto.com/2014/02/bitcoins-hard-way-using-raw-bitcoin.html
  // 02 is the integer, 30 is the sequence
  var left = '02' + getStringBufferLength(b1) + b1;
  var right = '02' + getStringBufferLength(b2) + b2;
  const sig = '30' + getStringBufferLength(left + right) + left + right;
  const sigAndHashcode = sig + Buffer.from([hashcode]).toString('hex');

  // Chuck it back into txObj
  txObj.ins[i].script = getStringBufferLength(sigAndHashcode) + sigAndHashcode + getStringBufferLength(pubKey) + pubKey;

  return txObj;
}

module.exports = {
  addressToScript: addressToScript,
  createRawTx: createRawTx,
  getStringBufferLength: getStringBufferLength,
  mkPubkeyHashReplayScript: mkPubkeyHashReplayScript,
  mkScriptHashScript: mkScriptHashScript,
  mkPubkeyHashScript: mkPubkeyHashScript,
  numToVarInt: numToVarInt,
  signatureForm: signatureForm,
  serializeTx: serializeTx,
  signTx: signTx
};