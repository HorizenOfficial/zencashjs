"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]; if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var varuint = require('varuint-bitcoin');
var zconfig = require('./config');
var _require = require('./bufferutils'),
  readUInt64LE = _require.readUInt64LE;
var _require2 = require('./transaction-helpers'),
  mkPayToPubkeyHashScript = _require2.mkPayToPubkeyHashScript;
var _require3 = require('./address'),
  pubKeyHashToAddr = _require3.pubKeyHashToAddr;
function getSidechainParamsFromBuffer(buf, offset) {
  var envPubKeyHash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : zconfig.mainnet.pubKeyHash;
  var _deserializeCswInputs = deserializeCswInputs(buf, offset),
    _deserializeCswInputs2 = _slicedToArray(_deserializeCswInputs, 2),
    vcsw_ccin = _deserializeCswInputs2[0],
    vcsw_ccinOffset = _deserializeCswInputs2[1];
  var _deserializeScOutputs = deserializeScOutputs(buf, vcsw_ccinOffset),
    _deserializeScOutputs2 = _slicedToArray(_deserializeScOutputs, 2),
    vsc_ccout = _deserializeScOutputs2[0],
    vsc_ccoutOffset = _deserializeScOutputs2[1];
  var _deserializeFtOutputs = deserializeFtOutputs(buf, vsc_ccoutOffset, envPubKeyHash),
    _deserializeFtOutputs2 = _slicedToArray(_deserializeFtOutputs, 2),
    vft_ccout = _deserializeFtOutputs2[0],
    vft_ccoutOffset = _deserializeFtOutputs2[1];
  var _deserializeMbtrOutpu = deserializeMbtrOutputs(buf, vft_ccoutOffset),
    _deserializeMbtrOutpu2 = _slicedToArray(_deserializeMbtrOutpu, 2),
    vmbtr_out = _deserializeMbtrOutpu2[0],
    vmbtr_outOffset = _deserializeMbtrOutpu2[1];
  var scParams = {
    vcsw_ccin: vcsw_ccin,
    vsc_ccout: vsc_ccout,
    vft_ccout: vft_ccout,
    vmbtr_out: vmbtr_out
  };
  return [scParams, vmbtr_outOffset];
}
function deserializeCswInputs(buf, offset) {
  var inputs = [];
  var numCsw = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var i = 0; i < numCsw; i++) {
    var value = readUInt64LE(buf, offset);
    offset += 8;
    var scId = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var nullifierLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var nullifier = buf.slice(offset, offset + nullifierLength).toString('hex');
    offset += nullifierLength;
    var pubKeyHash = buf.slice(offset, offset + 20).reverse().toString('hex');
    offset += 20;
    var proofLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var scProof = buf.slice(offset, offset + proofLength).toString('hex');
    offset += proofLength;
    var actCertDataHashLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var actCertDataHash = buf.slice(offset, offset + actCertDataHashLength).toString('hex');
    offset += actCertDataHashLength;
    var ceasingCumScTxCommTreeLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var ceasingCumScTxCommTree = buf.slice(offset, offset + ceasingCumScTxCommTreeLength).toString('hex');
    offset += ceasingCumScTxCommTreeLength;
    var redeemScriptLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var redeemScriptHex = buf.slice(offset, offset + redeemScriptLength).toString('hex');
    offset += redeemScriptLength;
    inputs.push({
      value: value,
      scId: scId,
      nullifier: nullifier,
      scriptPubKey: {
        hex: mkPayToPubkeyHashScript(pubKeyHash)
      },
      scProof: scProof,
      actCertDataHash: actCertDataHash,
      ceasingCumScTxCommTree: ceasingCumScTxCommTree,
      redeemScript: {
        hex: redeemScriptHex
      }
    });
  }
  return [inputs, offset];
}
function deserializeScOutputs(buf, offset) {
  var outputs = [];
  var vFieldElementCertificateFieldConfig = [];
  var vBitVectorCertificateFieldConfig = [];
  var constant = '';
  var wCeasedVk = '';
  var provingSystem = new Map([[0, 'Undefined'], [1, 'Darlin'], [2, 'CoboundaryMarlin']]);
  var numSco = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var i = 0; i < numSco; i++) {
    var withdrawalEpochLength = buf.readUIntLE(offset, 3);
    offset += 3;
    var version = buf.readInt8(offset);
    offset += 1;
    var value = readUInt64LE(buf, offset);
    offset += 8;
    var address = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var customDataLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var customData = buf.slice(offset, offset + customDataLength).toString('hex');
    offset += customDataLength;
    var constantDataOption = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    if (constantDataOption === 1) {
      var constantDataLength = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      constant = buf.slice(offset, offset + constantDataLength).toString('hex');
      offset += constantDataLength;
    }
    var certVkLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    var wCertVk = buf.slice(offset, offset + certVkLength).toString('hex');
    offset += certVkLength;
    var certProvingSystem = provingSystem.get(parseInt(wCertVk.substring(0, 2)));
    var wCeasedVkOption = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    if (wCeasedVkOption === 1) {
      var wCeasedVkLength = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      wCeasedVk = buf.slice(offset, offset + wCeasedVkLength).toString('hex');
      offset += wCeasedVkLength;
    }
    var vFieldElementCertificateFieldConfigLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    for (var _i2 = 0; _i2 < vFieldElementCertificateFieldConfigLength; _i2++) {
      vFieldElementCertificateFieldConfig.push(buf.readUInt8(offset));
      offset += 1;
    }
    var vBitVectorCertificateFieldConfigLength = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    for (var _i3 = 0; _i3 < vBitVectorCertificateFieldConfigLength; _i3++) {
      var bitVector = buf.readUInt32LE(offset);
      var maxCompressedSize = buf.readUInt32LE(offset + 4);
      vBitVectorCertificateFieldConfig.push([bitVector, maxCompressedSize]);
      offset += 8;
    }
    var ftScFee = readUInt64LE(buf, offset);
    offset += 8;
    var mbtrScFee = readUInt64LE(buf, offset);
    offset += 8;
    var mbtrRequestDataLength = buf.readUInt8(offset);
    offset += 1;
    var item = _objectSpread(_objectSpread({
      n: i,
      version: version,
      withdrawalEpochLength: withdrawalEpochLength,
      value: value,
      address: address,
      certProvingSystem: certProvingSystem,
      customData: customData
    }, constant !== undefined && constant !== '' && {
      constant: constant
    }), {}, {
      wCertVk: wCertVk,
      vFieldElementCertificateFieldConfig: vFieldElementCertificateFieldConfig,
      vBitVectorCertificateFieldConfig: vBitVectorCertificateFieldConfig,
      ftScFee: ftScFee,
      mbtrScFee: mbtrScFee,
      mbtrRequestDataLength: mbtrRequestDataLength
    });
    if (wCeasedVk) {
      item.wCeasedVk = wCeasedVk;
      item.cswProvingSystem = provingSystem.get(parseInt(wCeasedVk.substring(0, 2)));
    }
    outputs.push(item);
  }
  return [outputs, offset];
}
function deserializeFtOutputs(buf, offset) {
  var envPubKeyHash = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : zconfig.mainnet.pubKeyHash;
  var outputs = [];
  var numVft = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var i = 0; i < numVft; i++) {
    var value = readUInt64LE(buf, offset);
    offset += 8;
    var address = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var scid = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var mcReturnAddress = buf.slice(offset, offset + 20).toString('hex');
    offset += 20;
    outputs.push({
      value: value,
      address: address,
      scid: scid,
      mcReturnAddress: pubKeyHashToAddr(mcReturnAddress, envPubKeyHash),
      n: i
    });
  }
  return [outputs, offset];
}
function deserializeMbtrOutputs(buf, offset) {
  var outputs = [];
  var numVmbtr = varuint.decode(buf, offset);
  offset += varuint.decode.bytes;
  for (var i = 0; i < numVmbtr; i++) {
    var scid = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32;
    var vScRequestData = [];
    var numVscRequestData = varuint.decode(buf, offset);
    offset += varuint.decode.bytes;
    for (var _i4 = 0; _i4 < numVscRequestData; _i4++) {
      var vscRequestDataLength = varuint.decode(buf, offset);
      offset += varuint.decode.bytes;
      var data = buf.slice(offset, offset + vscRequestDataLength).toString('hex');
      offset += vscRequestDataLength;
      vScRequestData.push(data);
    }
    var pubKeyHash = buf.slice(offset, offset + 20).reverse().toString('hex');
    offset += 20;
    var scFee = readUInt64LE(buf, offset);
    offset += 8;
    outputs.push({
      n: i,
      scid: scid,
      vScRequestData: vScRequestData,
      mcDestinationAddress: {
        pubkeyhash: pubKeyHash
      },
      scFee: scFee
    });
  }
  return [outputs, offset];
}
module.exports = {
  getSidechainParamsFromBuffer: getSidechainParamsFromBuffer
};