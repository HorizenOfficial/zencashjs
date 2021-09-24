module.exports = function formatCertificate (txJson) {
    var txObj = {};
    txObj.version = txJson.version;

    txObj.cert = {
        ...txJson.cert, 
        ftScFee: txJson.cert.ftScFee * 1e8,
        mbtrScFee: txJson.cert.mbtrScFee * 1e8
    }

    const formattedInput = [];
    txJson.vin.forEach(input => {
        formattedInput.push({
            output: { hash: input.txid, vout: input.vout }, 
            script: input.scriptSig.hex, 
            sequence: "ffffffff",
            prevScriptPubKey: ''
        })
    });
    txObj.ins = formattedInput;

    const formattedOutput = [];
    txJson.vout.forEach(output => {
        formattedOutput.push({
            script: output.scriptPubKey.hex,
            satoshis: output.valueZat,
            ...(output['backward transfer'] && {
                isFromBackwardTransfer: output['backward transfer'], 
                pubKeyHash: output.pubkeyhash
            })
        })
    });
    txObj.outs = formattedOutput;

    return txObj
} 

