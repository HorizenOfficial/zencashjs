var varuint = require('varuint-bitcoin')
var zbufferutils = require('./bufferutils')

function deserializeCertFields (buf: Buffer, offset: number) {
    const sidechainId = buf.slice(offset, offset + 32).reverse().toString('hex');
    offset += 32
  
    const epochNumber = buf.readInt32LE(offset);
    offset += 4 
  
    const quality = zbufferutils.readUInt64LE(buf, offset)
    offset += 8; 
  
    const endEpochCumScTxCommTreeRootLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes
    const endEpochCumScTxCommTreeRoot = buf.slice(offset, offset + endEpochCumScTxCommTreeRootLen).toString('hex');
    offset += endEpochCumScTxCommTreeRootLen
  
    const scProofLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes
    const scProof = buf.slice(offset, offset + scProofLen).toString('hex');
    offset += scProofLen
  
    const vFieldElementCertificateFieldLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes
    let vFieldElementCertificateField = [];
    for (let i = 0; i < vFieldElementCertificateFieldLen; i++) {
      let fieldLen = varuint.decode(buf, offset);
      offset += varuint.decode.bytes
  
      vFieldElementCertificateField.push(buf.slice(offset, offset + fieldLen).toString('hex'));
      offset += fieldLen
    }
  
    const vBitVectorCertificateFieldLen = varuint.decode(buf, offset);
    offset += varuint.decode.bytes
    let vBitVectorCertificateField = [];
    for (let i = 0; i < vBitVectorCertificateFieldLen; i++) {
      let fieldLen = varuint.decode(buf, offset);
      offset += varuint.decode.bytes
  
      vBitVectorCertificateField.push(buf.slice(offset, offset + fieldLen).toString('hex'));
      offset += fieldLen
    }
  
    const ftScFee = zbufferutils.readUInt64LE(buf, offset);
    offset += 8;
    
    const mbtrScFee = zbufferutils.readUInt64LE(buf, offset)
    offset += 8;
    
    const cert = {
      sidechainId,
      epochNumber,
      quality,
      endEpochCumScTxCommTreeRoot,
      scProof,
      vFieldElementCertificateField,
      vBitVectorCertificateField,
      ftScFee,
      mbtrScFee,
    }
  
    return { cert, offset }
  }

  module.exports = {
    deserializeCertFields: deserializeCertFields
  }