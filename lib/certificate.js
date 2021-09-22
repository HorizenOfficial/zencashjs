"use strict";

var varuint = require('varuint-bitcoin');

var zbufferutils = require('./bufferutils');

function deserializeCertFields(buf, offset) {
  var sidechainId = buf.slice(offset, offset + 32).reverse().toString('hex');
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
  var cert = {
    sidechainId: sidechainId,
    epochNumber: epochNumber,
    quality: quality,
    endEpochCumScTxCommTreeRoot: endEpochCumScTxCommTreeRoot,
    scProof: scProof,
    vFieldElementCertificateField: vFieldElementCertificateField,
    vBitVectorCertificateField: vBitVectorCertificateField,
    ftScFee: ftScFee,
    mbtrScFee: mbtrScFee
  };
  return [cert, offset];
}

module.exports = {
  deserializeCertFields: deserializeCertFields
};