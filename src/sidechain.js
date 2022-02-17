// @flow
var varuint = require('varuint-bitcoin');
var zconfig = require('./config')
var { readUInt64LE } = require('./bufferutils');
var { mkPayToPubkeyHashScript } = require('./transaction-helpers');
var { pubKeyHashToAddr } = require('./address');

function getSidechainParamsFromBuffer(
    buf: Buffer, 
    offset: number, 
    envPubKeyHash: string = zconfig.mainnet.pubKeyHash
) {
    const [vcsw_ccin, vcsw_ccinOffset] = deserializeCswInputs(buf, offset);
    const [vsc_ccout, vsc_ccoutOffset] = deserializeScOutputs(buf, vcsw_ccinOffset);
    const [vft_ccout, vft_ccoutOffset] = deserializeFtOutputs(buf, vsc_ccoutOffset, envPubKeyHash);
    const [vmbtr_out, vmbtr_outOffset] = deserializeMbtrOutputs(buf, vft_ccoutOffset);

    const scParams = {
        vcsw_ccin,
        vsc_ccout,
        vft_ccout,
        vmbtr_out
    };

    return [scParams, vmbtr_outOffset];
}

function deserializeCswInputs(buf: Buffer, offset: number) {
    const inputs = [];
    const numCsw = varuint.decode(buf, offset)
    offset += varuint.decode.bytes;

    for (let i = 0; i < numCsw; i++) {
        const value = readUInt64LE(buf, offset);
        offset += 8;

        const scId = buf.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        const nullifierLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const nullifier = buf.slice(offset, offset + nullifierLength).toString('hex');
        offset += nullifierLength;

        const pubKeyHash = buf.slice(offset, offset + 20).reverse().toString('hex');
        offset += 20;

        const proofLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const scProof = buf.slice(offset, offset + proofLength).toString('hex');
        offset += proofLength;

        const actCertDataHashLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const actCertDataHash = buf.slice(offset, offset + actCertDataHashLength).toString('hex');
        offset += actCertDataHashLength;

        const ceasingCumScTxCommTreeLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const ceasingCumScTxCommTree = buf.slice(offset, offset + ceasingCumScTxCommTreeLength).toString('hex');
        offset += ceasingCumScTxCommTreeLength;
       
        const redeemScriptLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const redeemScriptHex = buf.slice(offset, offset + redeemScriptLength).toString('hex');
        offset += redeemScriptLength;

        inputs.push({
            value,
            scId,
            nullifier,
            scriptPubKey: {
                hex: mkPayToPubkeyHashScript(pubKeyHash)
            },
            scProof,
            actCertDataHash,
            ceasingCumScTxCommTree,
            redeemScript: {
                hex: redeemScriptHex
            }
        });
    }

    return [inputs, offset];
}

function deserializeScOutputs(buf: Buffer, offset: number) {
    const outputs = [];
    const vFieldElementCertificateFieldConfig = [];
    const vBitVectorCertificateFieldConfig = [];
    let constant = '';
    let wCeasedVk = '';

    const numSco = varuint.decode(buf, offset)
    offset += varuint.decode.bytes;

    for (let i = 0; i < numSco; i++) {
        const withdrawalEpochLength = buf.readInt32LE(offset);
        offset += 4;

        const value = readUInt64LE(buf, offset)
        offset += 8;

        const address = buf.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        const customDataLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const customData = buf.slice(offset, offset + customDataLength).toString('hex');
        offset += customDataLength;

        const constantDataOption = varuint.decode(buf, offset)
        offset += varuint.decode.bytes;

        if (constantDataOption === 1) {
            const constantDataLength = varuint.decode(buf, offset);
            offset += varuint.decode.bytes;
    
            constant = buf.slice(offset, offset + constantDataLength).toString('hex');
            offset += constantDataLength;
        }

        const certVkLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;

        const wCertVk = buf.slice(offset, offset + certVkLength).toString('hex');
        offset += certVkLength;

        const wCeasedVkOption = varuint.decode(buf, offset)
        offset += varuint.decode.bytes;

        if (wCeasedVkOption === 1) {
            const wCeasedVkLength = varuint.decode(buf, offset);
            offset += varuint.decode.bytes;
    
            wCeasedVk = buf.slice(offset, offset + wCeasedVkLength).toString('hex');
            offset += wCeasedVkLength;
        }

        const vFieldElementCertificateFieldConfigLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;
        for (let i = 0; i < vFieldElementCertificateFieldConfigLength; i++) {
          vFieldElementCertificateFieldConfig.push(buf.readUInt8(offset));
          offset += 1;
        }

        const vBitVectorCertificateFieldConfigLength = varuint.decode(buf, offset);
        offset += varuint.decode.bytes;
        for (let i = 0; i < vBitVectorCertificateFieldConfigLength; i++) {
            const bitVector = buf.readUInt32LE(offset);
            const maxCompressedSize = buf.readUInt32LE(offset + 4);
            vBitVectorCertificateFieldConfig.push([bitVector, maxCompressedSize]);
            offset += 8;
        }

        const ftScFee = readUInt64LE(buf, offset)
        offset += 8;

        const mbtrScFee = readUInt64LE(buf, offset)
        offset += 8;

        const mbtrRequestDataLength = buf.readUInt8(offset);
        offset += 1;

        outputs.push({
            n: i,
            withdrawalEpochLength,
            value,
            address,
            customData,
            constant,
            wCertVk,
            wCeasedVk,
            vFieldElementCertificateFieldConfig,
            vBitVectorCertificateFieldConfig,
            ftScFee,
            mbtrScFee,
            mbtrRequestDataLength
        });
    }

    return [outputs, offset];
}

function deserializeFtOutputs(
    buf: Buffer, 
    offset: number, 
    envPubKeyHash: string = zconfig.mainnet.pubKeyHash
) {
    const outputs = [];

    const numVft = varuint.decode(buf, offset)
    offset += varuint.decode.bytes;

    for (let i = 0; i < numVft; i++) {
        const value = readUInt64LE(buf, offset)
        offset += 8;

        const address = buf.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        const scid = buf.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        const mcReturnAddress = buf.slice(offset, offset + 20).toString('hex')
        offset += 20;

        outputs.push({
           value,
           address,
           scid,
           mcReturnAddress,
           n: i
        });
    }

    return [outputs, offset];
}

function deserializeMbtrOutputs(buf: Buffer, offset: number) {
    const outputs = [];

    const numVmbtr = varuint.decode(buf, offset)
    offset += varuint.decode.bytes;

    for (let i = 0; i < numVmbtr; i++) {
        const scid = buf.slice(offset, offset + 32).reverse().toString('hex');
        offset += 32;

        const vScRequestData = [];
        const numVscRequestData = varuint.decode(buf, offset)
        offset += varuint.decode.bytes;

        for (let i = 0; i < numVscRequestData; i++) {
            const vscRequestDataLength = varuint.decode(buf, offset)
            offset += varuint.decode.bytes;

            const data = buf.slice(offset, offset + vscRequestDataLength).toString('hex');
            offset += vscRequestDataLength;

            vScRequestData.push(data);
        }

        const pubKeyHash = buf.slice(offset, offset + 20).reverse().toString('hex');
        offset += 20;

        const scFee = readUInt64LE(buf, offset)
        offset += 8;

        outputs.push({
            n: i,
            scid,
            vScRequestData,
            mcDestinationAddress: {
                pubkeyhash: pubKeyHash
            },
            scFee
        });
    }

    return [outputs, offset];
}


module.exports = { getSidechainParamsFromBuffer }