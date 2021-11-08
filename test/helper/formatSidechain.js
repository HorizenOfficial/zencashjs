module.exports = function formatSidechain (txJson) {
  var txObj = {};
  txObj.version = txJson.version;
  txObj.locktime = txJson.locktime;

  txObj.vsc_ccout = txJson.vsc_ccout.map(i => {
    delete i.scid; // RPC call would be needed for scid
    return { 
      ...i, 
      value: i.value * 1e8, 
      ftScFee: i.ftScFee * 1e8,
      mbtrScFee: i.mbtrScFee * 1e8
    }
  })

  txObj.vft_ccout = txJson.vft_ccout.map(i => ({
    ...i,
    value: i.value * 1e8
  }))

  txObj.vcsw_ccin = txJson.vcsw_ccin.map(i => ({
    ...i,
    value: i.value * 1e8,
    scriptPubKey: {
      hex: i.scriptPubKey.hex
    },
    redeemScript: {
      hex: i.redeemScript.hex
    }
  }))

  txObj.vmbtr_out = txJson.vmbtr_out.map(i => ({
    ...i,
    scFee: i.scFee * 1e8,
    mcDestinationAddress: {
      pubkeyhash: i.mcDestinationAddress.pubkeyhash
    }
  }))

  const formattedInput = [];
  txJson.vin.forEach(input => {
      formattedInput.push({
          output: { hash: input.txid, vout: input.vout }, 
          script: input.scriptSig.hex, 
          sequence: input.sequence.toString(16).padStart(8,'0').match(/../g).reverse().join(''), // number -> LE format
          prevScriptPubKey: ''
      })
  });
  txObj.ins = formattedInput;

  const formattedOutput = [];
  txJson.vout.forEach(output => {
      formattedOutput.push({
          script: output.scriptPubKey.hex,
          satoshis: output.value * 1e8,
      })
  });
  txObj.outs = formattedOutput;

  return txObj
} 

