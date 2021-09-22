"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var bs58check = require('bs58check');

var elliptic = require('elliptic');

var secp256k1 = new elliptic.ec('secp256k1');
/* eslint new-cap: ["error", { "newIsCap": false }] */

var varuint = require('varuint-bitcoin');

var zconfig = require('./config');

var zbufferutils = require('./bufferutils');

var zcrypto = require('./crypto');

var zconstants = require('./constants');

var zaddress = require('./address');

var zopcodes = require('./opcodes');

function mkNullDataReplayScript(data, blockHeight, blockHash) {
  var dataHex = Buffer.from(data).toString('hex'); // Block hash is encoded in little indian

  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');
  return zopcodes.OP_RETURN + zbufferutils.getPushDataLength(dataHex) + dataHex + zbufferutils.getPushDataLength(blockHashHex) + blockHashHex + serializeScriptBlockHeight(blockHeight) + zopcodes.OP_CHECKBLOCKATHEIGHT;
}
/*
 * Given an address, generates a pubkeyhash replay type script needed for the transaction
 * More info: https://github.com/HorizenOfficial/zen/blob/bb93453d39f86f7889e87c50f06400427a66f816/src/script/standard.cpp#L403
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * @param {String} pubKeyHash (optional)
 * return {String} pubKeyScript
 */


function mkPubkeyHashReplayScript(address, blockHeight, blockHash) {
  var pubKeyHash = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : zconfig.mainnet.pubKeyHash;
  var addrHex = bs58check.decode(address).toString('hex'); // Cut out pubKeyHash

  var subAddrHex = addrHex.substring(pubKeyHash.length, addrHex.length); // Block hash is encoded in little indian

  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');
  return zopcodes.OP_DUP + zopcodes.OP_HASH160 + zbufferutils.getPushDataLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUALVERIFY + zopcodes.OP_CHECKSIG + zbufferutils.getPushDataLength(blockHashHex) + blockHashHex + serializeScriptBlockHeight(blockHeight) + zopcodes.OP_CHECKBLOCKATHEIGHT;
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
  // Block hash is encoded in little indian

  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex');
  return zopcodes.OP_HASH160 + zbufferutils.getPushDataLength(subAddrHex) + subAddrHex + zopcodes.OP_EQUAL + zbufferutils.getPushDataLength(blockHashHex) + blockHashHex + serializeScriptBlockHeight(blockHeight) + zopcodes.OP_CHECKBLOCKATHEIGHT;
}

function mkReplayScript(pubKeyHash) {
  return zopcodes.OP_DUP + zopcodes.OP_HASH160 + zbufferutils.getPushDataLength(pubKeyHash) + Buffer.from(pubKeyHash, 'hex').reverse().toString('hex') + zopcodes.OP_EQUALVERIFY + zopcodes.OP_CHECKSIG;
}
/*
 * Given a block height serialize it as ScriptNum for including into Script
 * @param {Number} blockHeight
 * return {String} Hex representation of ScriptNum
 */


function serializeScriptBlockHeight(blockHeight) {
  // check for scriptNum special case values
  if (blockHeight >= -1 && blockHeight <= 16) {
    var res = 0;

    if (blockHeight == -1 || blockHeight >= 1 && blockHeight <= 16) {
      res = blockHeight + (zopcodes.OP_1 - 1);
    } else if (blockHeight == 0) {
      res = zopcodes.OP_0;
    }

    return res.toString();
  } else {
    // Minimal encoding
    var blockHeightBuffer = zbufferutils.scriptNumEncode(blockHeight);
    var blockHeightHex = blockHeightBuffer.toString('hex');
    return zbufferutils.getPushDataLength(blockHeightHex) + blockHeightHex;
  }
}
/*
 * Given an address, generates an output script
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * return {String} output script
 */


function addressToScript(address, blockHeight, blockHash, data) {
  // NULL transaction
  if (address === null || address === undefined) {
    return mkNullDataReplayScript(data, blockHeight, blockHash);
  }

  var prefix = bs58check.decode(address).toString('hex').slice(0, 4); // P2SH replay starts with a '2096' or '2092' prefix

  if (prefix === '2096' || prefix === '2092') {
    return mkScriptHashReplayScript(address, blockHeight, blockHash);
  } // P2PKH-replay is a replacement for P2PKH
  // P2PKH starts with a '2089' or '2098' prefix


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
  var newTx = JSON.parse(JSON.stringify(txObj)); // Only sign the specified index

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

function deserializeVout(buf, offset, isFromBackwardTransfer) {
  var outputs = [];
  var voutLen = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;

  for (var i = 0; i < voutLen; i++) {
    var satoshis = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;

    if (!isFromBackwardTransfer) {
      var scriptLen = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      var script = buf.slice(offset, offset + scriptLen).toString('hex');
      offset += scriptLen;
      outputs.push({
        satoshis: satoshis,
        script: script
      });
    } else {
      var pubKeyHash = buf.slice(offset, offset + 20).reverse().toString('hex');
      offset += 20;

      var _script = mkReplayScript(pubKeyHash);

      outputs.push({
        satoshis: satoshis,
        script: _script,
        isFromBackwardTransfer: true,
        pubKeyHash: pubKeyHash
      });
    }
  }

  return [outputs, offset];
}
/*
 * Deserializes a hex string into a TXOBJ
 * @param {String} hex string
 * @param {Boolean} specify if we have prevScriptPubKey field defined inside inputs
 * @return {Object} txOBJ
 */


function deserializeTx(hexStr) {
  var withPrevScriptPubKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var buf = Buffer.from(hexStr, 'hex');
  var offset = 0; // Out txobj

  var txObj = {
    version: 0,
    ins: [],
    outs: []
  }; // Version

  var version = buf.readInt32LE(offset);
  txObj.version = version;
  offset += 4; // Certificate

  if (version === -5) {
    var scId = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var epochNumber = buf.readInt32LE(offset);
    offset += 4;
    var quality = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;
    var endEpochCumScTxCommTreeRootLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var endEpochCumScTxCommTreeRoot = buf.slice(offset, offset + endEpochCumScTxCommTreeRootLen).toString('hex');
    offset += endEpochCumScTxCommTreeRootLen;
    var scProofLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var scProof = buf.slice(offset, offset + scProofLen).toString('hex');
    offset += scProofLen;
    var vFieldElementCertificateFieldLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var vFieldElementCertificateField = [];

    for (var i = 0; i < vFieldElementCertificateFieldLen; i++) {
      var fieldLen = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      vFieldElementCertificateField.push(buf.slice(offset, offset + fieldLen).toString('hex'));
      offset += fieldLen;
    }

    var vBitVectorCertificateFieldLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var vBitVectorCertificateField = [];

    for (var _i = 0; _i < vBitVectorCertificateFieldLen; _i++) {
      var _fieldLen = varuint.decode(buf, offset);

      offset += varuint.decode.bytes;
      vBitVectorCertificateField.push(buf.slice(offset, offset + _fieldLen).toString('hex'));
      offset += _fieldLen;
    }

    var ftScFee = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;
    var mbtrScFee = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;
    txObj.cert = {
      scId: scId,
      epochNumber: epochNumber,
      quality: quality,
      endEpochCumScTxCommTreeRoot: endEpochCumScTxCommTreeRoot,
      scProof: scProof,
      vFieldElementCertificateField: vFieldElementCertificateField,
      vBitVectorCertificateField: vBitVectorCertificateField,
      ftScFee: ftScFee,
      mbtrScFee: mbtrScFee
    };
  } // Vins


  var vinLen = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;

  for (var _i2 = 0; _i2 < vinLen; _i2++) {
    // Else its
    var hash = buf.slice(offset, offset + 32);
    offset += 32;
    var vout = buf.readUInt32LE(offset);
    offset += 4;
    var prevScriptPubKey = "";

    if (withPrevScriptPubKey) {
      var prevScriptPubKeyLen = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      prevScriptPubKey = buf.slice(offset, offset + prevScriptPubKeyLen);
      offset += prevScriptPubKeyLen;
    }

    var scriptLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var script = buf.slice(offset, offset + scriptLen);
    offset += scriptLen;
    var sequence = buf.slice(offset, offset + 4).toString('hex');
    offset += 4;
    txObj.ins.push({
      output: {
        hash: hash.reverse().toString('hex'),
        vout: vout
      },
      script: script.toString('hex'),
      sequence: sequence,
      prevScriptPubKey: prevScriptPubKey.toString('hex')
    });
  } // Vouts


  var _deserializeVout = deserializeVout(buf, offset, false),
      _deserializeVout2 = _slicedToArray(_deserializeVout, 2),
      outputs = _deserializeVout2[0],
      newOffset = _deserializeVout2[1];

  txObj.outs = outputs;
  offset = newOffset; // Backward transfer outputs

  if (version === -5) {
    var _deserializeVout3 = deserializeVout(buf, offset, true),
        _deserializeVout4 = _slicedToArray(_deserializeVout3, 2),
        btOutputs = _deserializeVout4[0],
        _newOffset = _deserializeVout4[1];

    txObj.outs = txObj.outs.concat(btOutputs);
    offset = _newOffset;
  }

  if (version != -5) {
    // Locktime
    txObj.locktime = buf.readInt32LE(offset);
    offset += 4;
  }

  return txObj;
}
/*
 * Serializes a TXOBJ into hex string
 * @param {Object} txObj
 * @param {Boolean} specify if we have prevScriptPubKey field defined inside inputs
 * return {String} hex string of txObj
 */


function serializeTx(txObj) {
  var withPrevScriptPubKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var serializedTx = '';

  var _buf16 = Buffer.alloc(4); // Version


  _buf16.writeUInt16LE(txObj.version, 0);

  serializedTx += _buf16.toString('hex'); // History

  serializedTx += zbufferutils.numToVarInt(txObj.ins.length);
  txObj.ins.map(function (i) {
    // Txids and vouts
    _buf16.writeUInt16LE(i.output.vout, 0);

    serializedTx += Buffer.from(i.output.hash, 'hex').reverse().toString('hex');
    serializedTx += _buf16.toString('hex');

    if (withPrevScriptPubKey) {
      // Doesn't work for length > 253 ....
      serializedTx += zbufferutils.getPushDataLength(i.prevScriptPubKey);
      serializedTx += i.prevScriptPubKey;
    } // Script Signature
    // Doesn't work for length > 253 ....


    serializedTx += zbufferutils.getPushDataLength(i.script);
    serializedTx += i.script; // Sequence

    serializedTx += i.sequence;
  }); // Outputs

  serializedTx += zbufferutils.numToVarInt(txObj.outs.length);
  txObj.outs.map(function (o) {
    // Write 64bit buffers
    // JS only supports 56 bit
    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/bufferutils.js#L25
    var _buf32 = Buffer.alloc(8); // Satoshis


    _buf32.writeInt32LE(o.satoshis & -1, 0);

    _buf32.writeUInt32LE(Math.floor(o.satoshis / 0x100000000), 4); // ScriptPubKey


    serializedTx += _buf32.toString('hex');
    serializedTx += zbufferutils.getPushDataLength(o.script);
    serializedTx += o.script;
  }); // Locktime

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
  var txObj = {
    locktime: 0,
    version: 1,
    ins: [],
    outs: []
  };
  txObj.ins = history.map(function (h) {
    return {
      output: {
        hash: h.txid,
        vout: h.vout
      },
      script: '',
      prevScriptPubKey: h.scriptPubKey,
      sequence: 'ffffffff'
    };
  });
  txObj.outs = recipients.map(function (o) {
    return {
      script: addressToScript(o.address, blockHeight, blockHash, o.data),
      satoshis: o.satoshis
    };
  });
  return txObj;
}
/*
 * Gets signature for the vin script
 * @params {string} privKey private key
 * @params {TXOBJ} signingTx a txobj whereby all the vin script's field are empty except for the one that needs to be signed
 * @params {number} hashcode
*/


function getScriptSignature(privKey, signingTx, hashcode) {
  // Buffer
  var _buf16 = Buffer.alloc(4);

  _buf16.writeUInt16LE(hashcode, 0);

  var signingTxHex = serializeTx(signingTx);

  var signingTxWithHashcode = signingTxHex + _buf16.toString('hex'); // Sha256 it twice, according to spec


  var msg = zcrypto.sha256x2(Buffer.from(signingTxWithHashcode, 'hex')); // Signing it

  var rawsig = secp256k1.sign(Buffer.from(msg, 'hex'), Buffer.from(privKey, 'hex'), {
    canonical: true
  }); // Convert it to DER format
  // Appending 01 to it cause
  // ScriptSig = <varint of total sig length> <SIG from code, including appended 01 SIGNHASH> <length of pubkey (0x21 or 0x41)> <pubkey>
  // https://bitcoin.stackexchange.com/a/36481

  var signatureDER = Buffer.from(rawsig.toDER()).toString('hex') + '01';
  return signatureDER;
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


function signTx(_txObj, i, privKey) {
  var compressPubKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
  var hashcode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : zconstants.SIGHASH_ALL;
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj)); // Prepare our signature
  // Get script from the current tx input

  var script = txObj.ins[i].prevScriptPubKey; // Populate current tx in with the prevScriptPubKey

  var signingTx = signatureForm(txObj, i, script, hashcode); // Get script signature

  var scriptSig = getScriptSignature(privKey, signingTx, hashcode); // Chuck it back into txObj and add pubkey
  // Protocol:
  // PUSHDATA
  // signature data and SIGHASH_ALL
  // PUSHDATA
  // public key data

  var pubKey = zaddress.privKeyToPubKey(privKey, compressPubKey);
  txObj.ins[i].script = zbufferutils.getPushDataLength(scriptSig) + scriptSig + zbufferutils.getPushDataLength(pubKey) + pubKey;
  return txObj;
}
/*
 * Gets signatures needed for multi-sign tx
 * @param {String} _txObj transaction object you wanna sign
 * @param {Int} index fof tx.in to sign
 * @param {privKey} One of the M private keys you (NOT WIF format!!!)
 * @param {string} redeemScript (redeemScript of the multi-sig)
 * @param {string} hashcode (SIGHASH_ALL, SIGHASH_NONE, etc)
 * return {String} signature
 */


function multiSign(_txObj, i, privKey, redeemScript) {
  var hashcode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : zconstants.SIGHASH_ALL;
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj)); // Populate current tx.ins[i] with the redeemScript

  var signingTx = signatureForm(txObj, i, redeemScript, hashcode);
  return getScriptSignature(privKey, signingTx, hashcode);
}
/*
 * Applies the signatures to the transaction object
 * NOTE: You NEED to supply the signatures in order.
 *       E.g. You made sigAddr1 with priv1, priv3, priv2
 *            You can provide signatures of (priv1, priv2) (priv3, priv2) ...
 *            But not (priv2, priv1)
 * @param {String} _txObj transaction object you wanna sign
 * @param {Int} index fof tx.in to sign
 * @param {[string]} signatures obtained from multiSign
 * @param {string} redeemScript (redeemScript of the multi-sig)
 * @param {string} hashcode (SIGHASH_ALL, SIGHASH_NONE, etc)
 * return {String} signature
 */


function applyMultiSignatures(_txObj, i, signatures, redeemScript) {
  var hashcode = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : zconstants.SIGHASH_ALL;
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj)); // TODO: make it stateless
  // Fix signature order
  // var rsFixed = redeemScript.slice(2)
  // var pubKeys = []
  // // 30 was chosen arbitrarily as the minimum length
  // // of a pubkey is 33
  // while (rsFixed.length > 30) {
  //   // Convert pushdatalength from hex to int
  //   // Extract public key
  //   var pushDataLength = parseInt(rsFixed.slice(0, 2), 16).toString(10)
  //   var pubkey = Buffer.from(rsFixed.slice(2), 'hex').slice(0, pushDataLength).toString('hex')
  //   pubKeys = pubKeys.concat(pubkey)
  //   rsFixed = rsFixed.slice(2 + pubkey.length)
  // }
  // var unmatched = JSON.parse(JSON.stringify(signatures))
  // const signaturesFixed = pubKeys.map(pubKey => {
  //   const keyPair = secp256k1.keyFromPublic(pubKey)
  //   var match    
  //   unmatched.some((sig, i) => {
  //     if (!sig) return false      
  //   })
  // })

  var redeemScriptPushDataLength = zbufferutils.getPushDataLength(redeemScript); // Lmao no idea, just following the source code

  if (redeemScriptPushDataLength.length > 2) {
    if (redeemScriptPushDataLength.length === 6) {
      redeemScriptPushDataLength = redeemScriptPushDataLength.slice(2, 4);
    }
  } // http://www.soroushjp.com/2014/12/20/bitcoin-multisig-the-hard-way-understanding-raw-multisignature-bitcoin-transactions/


  txObj.ins[i].script = zopcodes.OP_0 + signatures.map(function (x) {
    return zbufferutils.getPushDataLength(x) + x;
  }).join('') + zopcodes.OP_PUSHDATA1 + redeemScriptPushDataLength + redeemScript;
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
  signTx: signTx,
  multiSign: multiSign,
  applyMultiSignatures: applyMultiSignatures,
  getScriptSignature: getScriptSignature,
  mkNullDataReplayScript: mkNullDataReplayScript
};