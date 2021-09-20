// import type { TXOBJ } from '../../src/types'

function formatCertificate (txJson) {
    var txObj = {};
    txObj.version = txJson.version;

    const  {scid, ...formattedCert} = txJson.cert

    txObj.cert = {
        ...formattedCert, ...{
            scId: txJson.cert.scid,
            ftScFee: txJson.cert.ftScFee * 100000000,
            mbtrScFee: txJson.cert.mbtrScFee * 100000000
        }
    }

    let formattedInput = [];
    txJson.vin.forEach(input => {
        formattedInput.push({
            output: {hash: input.txid, vout: input.vout}, 
            script: input.scriptSig.hex, 
            sequence: "ffffffff", // input.sequence?
            prevScriptPubKey: ''
        })
    });
    txObj.ins = formattedInput;

    let formattedOutput = [];
    txJson.vout.forEach(output => {
        formattedOutput.push({
            script: output.scriptPubKey.hex,
            satoshis: output.valueZat,
            ... ( output['backward transfer'] && {isFromBackwardTransfer: output['backward transfer'], pubKeyHash: output.pubkeyhash})
        })
    });
    txObj.outs = formattedOutput;

    return txObj
} 

module.exports = {
    formatCertificate: formatCertificate
}
