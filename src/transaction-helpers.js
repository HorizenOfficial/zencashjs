var zopcodes = require('./opcodes');
var zbufferutils = require('./bufferutils');

function mkPayToPubkeyHashScript(pubKeyHash: string): string {
  return (
    zopcodes.OP_DUP + 
    zopcodes.OP_HASH160 + 
    zbufferutils.getPushDataLength(pubKeyHash) + 
    Buffer.from(pubKeyHash, 'hex').reverse().toString('hex') + 
    zopcodes.OP_EQUALVERIFY + 
    zopcodes.OP_CHECKSIG
  )
}

module.exports = { mkPayToPubkeyHashScript }