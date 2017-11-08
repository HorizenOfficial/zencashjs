'use strict';

var bs58check = require('bs58check');

var elliptic = require('elliptic');
var secp256k1 = new elliptic.ec('secp256k1'); /* eslint new-cap: ["error", { "newIsCap": false }] */
var varuint = require('varuint-bitcoin');
var zconfig = require('./config');
var zbufferutils = require('./bufferutils');
var zcrypto = require('./crypto');
var zconstants = require('./constants');
var zaddress = require('./address');
var zopcodes = require('./opcodes');

/* More info: https://github.com/ZencashOfficial/zen/blob/master/src/script/standard.cpp#L377
 * Given an address, generates a pubkeyhash replay type script needed for the transaction
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * @param {String} pubKeyHash (optional)
 * return {String} pubKeyScript
 */
function mkPubkeyHashReplayScript(address, blockHeight, blockHash, pubKeyHash) {
  // Get lengh of pubKeyHash (so we know where to substr later on)
  pubKeyHash = pubKeyHash || zconfig.mainnet.pubKeyHash;

  var addrHex = bs58check.decode(address).toString('hex');

  // Cut out pubKeyHash
  var subAddrHex = addrHex.substring(pubKeyHash.length, addrHex.length);

  // Minimal encoding
  var blockHeightBuffer = Buffer.alloc(4);
  blockHeightBuffer.writeUInt32LE(blockHeight, 0);
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3);
  }
  var blockHeightHex = blockHeightBuffer.toString('hex');

  // block hash is encoded in little indian
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');

  // '14' is the length of the subAddrHex (in bytes)
  return zopcodes.OP_DUP + zopcodes.OP_HASH160 + zbufferutils.getStringBufferLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUALVERIFY + zopcodes.OP_CHECKSIG + zbufferutils.getStringBufferLength(blockHashHex) + blockHashHex + zbufferutils.getStringBufferLength(blockHeightHex) + blockHeightHex + zopcodes.OP_CHECKBLOCKATHEIGHT;
}

/*
 * Given an address, generates a script hash replay type script needed for the transaction
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * return {String} scriptHash script
 */
function mkScriptHashReplayScript(address, blockHeight, blockHash) {
  var addrHex = bs58check.decode(address).toString('hex');
  var subAddrHex = addrHex.substring(4, addrHex.length); // Cut out the '00' (we also only want 14 bytes instead of 16)

  var blockHeightBuffer = Buffer.alloc(4);
  blockHeightBuffer.writeUInt32LE(blockHeight, 0);
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3);
  }
  var blockHeightHex = blockHeightBuffer.toString('hex');

  // Need to reverse it
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');

  // '14' is the length of the subAddrHex (in bytes)
  return zopcodes.OP_HASH160 + zbufferutils.getStringBufferLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUAL + zbufferutils.getStringBufferLength(blockHashHex) + blockHashHex + zbufferutils.getStringBufferLength(blockHeightHex) + blockHeightHex + zopcodes.OP_CHECKBLOCKATHEIGHT;
}

/*
 * Given an address, generates an output script
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * return {String} output script
 */
function addressToScript(address, blockHeight, blockHash) {
  // P2SH replay starts with a 's', or 't'
  if (address[1] === 's' || address[0] === 't') {
    return mkScriptHashReplayScript(address, blockHeight, blockHash);
  }

  // P2PKH-replay is a replacement for P2PKH
  // P2PKH-replay starts with a 0
  return mkPubkeyHashReplayScript(address, blockHeight, blockHash);
}

/*
 * Signature hashing for TXOBJ
 * @param {String} address
 * @param {Number} i, which transaction input to sign
 * @param {String} hex string of script
 * @param {String} hash code (SIGHASH_ALL, SIGHASH_NONE...)
 * return {String} output script
 */
function signatureForm(txObj, i, script, hashcode) {
  // Copy object so we don't rewrite it
  var newTx = JSON.parse(JSON.stringify(txObj));

  for (var j = 0; j < newTx.ins.length; j++) {
    newTx.ins[j].script = '';
  }
  newTx.ins[i].script = script;

  if (hashcode === zconstants.SIGHASH_NONE) {
    newTx.outs = [];
  } else if (hashcode === zconstants.SIGHASH_SINGLE) {
    newTx.outs = newTx.outs.slice(0, newTx.ins.length);
    for (var _j = 0; _j < newTx.ins.length - 1; ++_j) {
      newTx.outs[_j].satoshis = Math.pow(2, 64) - 1;
      newTx.outs[_j].script = '';
    }
  } else if (hashcode === zconstants.SIGHASH_ANYONECANPAY) {
    newTx.ins = [newTx.ins[i]];
  }

  return newTx;
}

/*
 * Deserializes a hex string into a TXOBJ
 * @param {String} hex string
 * @return {Object} txOBJ
 */
function deserializeTx(hexStr) {
  var buf = Buffer.from(hexStr, 'hex');
  var offset = 0;

  // Out txobj
  var txObj = { version: 0, locktime: 0, ins: [], outs: []

    // Version
  };txObj.version = buf.readUInt32LE(offset);
  offset += 4;

  // Vins
  var vinLen = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var i = 0; i < vinLen; i++) {
    var hash = buf.slice(offset, offset + 32);
    offset += 32;

    var vout = buf.readUInt32LE(offset);
    offset += 4;

    var scriptLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;

    var script = buf.slice(offset, offset + scriptLen);
    offset += scriptLen;

    var sequence = buf.slice(offset, offset + 4).toString('hex');
    offset += 4;

    txObj.ins.push({
      output: { hash: hash.reverse().toString('hex'), vout: vout },
      script: script.toString('hex'),
      sequence: sequence,
      prevScriptPubKey: ''
    });
  }

  // Vouts
  var voutLen = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var _i = 0; _i < voutLen; _i++) {
    var satoshis = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;

    var _scriptLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;

    var _script = buf.slice(offset, offset + _scriptLen);
    offset += _scriptLen;

    txObj.outs.push({
      satoshis: satoshis,
      script: _script.toString('hex')
    });
  }

  // Locktime
  txObj.locktime = buf.readInt32LE(offset);
  offset += 4;

  return txObj;
}

/*
 * Serializes a TXOBJ into hex string
 * @param {Object} txObj
 * return {String} hex string of txObj
 */
function serializeTx(txObj) {
  var serializedTx = '';
  var _buf16 = Buffer.alloc(4);

  // Version
  _buf16.writeUInt16LE(txObj.version, 0);
  serializedTx += _buf16.toString('hex');

  // History
  serializedTx += zbufferutils.numToVarInt(txObj.ins.length);
  txObj.ins.map(function (i) {
    // Txids and vouts
    _buf16.writeUInt16LE(i.output.vout, 0);
    serializedTx += Buffer.from(i.output.hash, 'hex').reverse().toString('hex');
    serializedTx += _buf16.toString('hex');

    // Script
    serializedTx += zbufferutils.getStringBufferLength(i.script);
    serializedTx += i.script;

    // Sequence
    serializedTx += i.sequence;
  });

  // Outputs
  serializedTx += zbufferutils.numToVarInt(txObj.outs.length);
  txObj.outs.map(function (o) {
    // Write 64bit buffers
    // JS only supports 56 bit
    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/bufferutils.js#L25
    var _buf32 = Buffer.alloc(8);

    _buf32.writeInt32LE(o.satoshis & -1, 0);
    _buf32.writeUInt32LE(Math.floor(o.satoshis / 0x100000000), 4);

    serializedTx += _buf32.toString('hex');
    serializedTx += zbufferutils.getStringBufferLength(o.script);
    serializedTx += o.script;
  });

  // Locktime
  _buf16.writeUInt16LE(txObj.locktime, 0);
  serializedTx += _buf16.toString('hex');

  return serializedTx;
}

/*
 * Creates a raw transaction
 * @param {[HISTORY]} history type, array of transaction history
 * @param {[RECIPIENTS]} recipient type, array of address on where to send coins to
 * @param {Number} blockHeight (latest - 300)
 * @param {String} blockHash of blockHeight
 * @return {TXOBJ} Transction Object (see TXOBJ type for info about structure)
 */
function createRawTx(history, recipients, blockHeight, blockHash) {
  var txObj = { locktime: 0, version: 1, ins: [], outs: [] };

  txObj.ins = history.map(function (h) {
    return {
      output: { hash: h.txid, vout: h.vout },
      script: '',
      prevScriptPubKey: h.scriptPubKey,
      sequence: 'ffffffff'
    };
  });
  txObj.outs = recipients.map(function (o) {
    return {
      script: addressToScript(o.address, blockHeight, blockHash),
      satoshis: o.satoshis
    };
  });

  return txObj;
}

/*
 * Signs the raw transaction
 * @param {String} rawTx raw transaction
 * @param {Int} i
 * @param {privKey} privKey (not WIF format)
 * @param {compressPubKey} compress public key before appending to scriptSig? (default false)
 * @param {hashcode} hashcode (default SIGHASH_ALL)
 * return {String} signed transaction
 */
function signTx(_txObj, i, privKey, compressPubKey, hashcode) {
  hashcode = hashcode || zconstants.SIGHASH_ALL;
  compressPubKey = compressPubKey || false;

  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj));

  // Buffer
  var _buf16 = Buffer.alloc(4);
  _buf16.writeUInt16LE(hashcode, 0);

  // Prepare signing
  var script = txObj.ins[i].prevScriptPubKey;

  // Prepare our signature
  var signingTx = signatureForm(txObj, i, script, hashcode);
  var signingTxHex = serializeTx(signingTx);
  var signingTxWithHashcode = signingTxHex + _buf16.toString('hex');

  // Sha256 it twice, according to spec
  var msg = zcrypto.sha256x2(Buffer.from(signingTxWithHashcode, 'hex'));

  // Signing it
  var rawsig = secp256k1.sign(Buffer.from(msg, 'hex'), Buffer.from(privKey, 'hex'), { canonical: true });

  // Convert it to DER format
  // Appending 01 to it cause
  // ScriptSig = <varint of total sig length> <SIG from code, including appended 01 SIGNHASH> <length of pubkey (0x21 or 0x41)> <pubkey>
  // https://bitcoin.stackexchange.com/a/36481
  var signatureDER = Buffer.from(rawsig.toDER()).toString('hex') + '01';

  // Chuck it back into txObj and add pubkey
  // WHAT? If it fails, uncompress/compress it and it should work...
  var pubKey = zaddress.privKeyToPubKey(privKey, compressPubKey);

  txObj.ins[i].script = zbufferutils.getStringBufferLength(signatureDER) + signatureDER + zbufferutils.getStringBufferLength(pubKey) + pubKey;

  return txObj;
}

module.exports = {
  addressToScript: addressToScript,
  createRawTx: createRawTx,
  mkPubkeyHashReplayScript: mkPubkeyHashReplayScript,
  mkScriptHashReplayScript: mkScriptHashReplayScript,
  signatureForm: signatureForm,
  serializeTx: serializeTx,
  deserializeTx: deserializeTx,
  signTx: signTx
};