var zcrypto = require('./crypto');
var bs58check = require('bs58check');

/* Useful OP codes for the scripting language 
 * Obtained from: https://github.com/ZencashOfficial/zen/blob/master/src/script/script.h
 */
const OP_DUP = '76';
const OP_HASH160 = 'a9';
const OP_EQUALVERIFY = '88';
const OP_CHECKSIG = 'ac';
const OP_CHECKBLOCKATHEIGHT = 'b4';

/*
 * Given an address, generates a pubkeyhashreplay type script needed for the transaction
 * @param {String} zencash address
 * return {String} pubKeyScript
 */
function mkPubkeyHashScript(address) {
  var addrHex = bs58check.decode(address).toString('hex');
  var subAddrHex = addrHex.substring(2, addrHex.length);
  var scriptHex = OP_DUP + OP_HASH160 + '14' + subAddrHex + OP_EQUALVERIFY + OP_CHECKSIG;
  return scriptHex;
}

/*
 * Creates a raw transaction
 * @param {[object]} history, array of history in the format: [{txid: 'transaction_id', vout: vout, value: value (insatoshi), address: txout address}]
 * @param {[object]} output address on where to send coins to [{value}]
 * @param {Int} Amount of zencash to send (in satoshis)
 * @return {String} raw transaction
 */
function createRawTranscation(history, outs) {
  // var txObj = {'locktime': 0, 'version': 1, 'ins': [], 'outs': []}
}

module.exports = {
  createRawTranscationv: createRawTranscation,
  mkPubkeyHashScript: mkPubkeyHashScript
};