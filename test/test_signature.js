var zencashjs = require('../lib');

// Calculate signature for rosetta combine endpoint.
/**
 * Input:
 *  -blockHash: block hash needed for the replay protection inside the output script.
 *  -blockHeight: block height of the corresponding block hash used inside the output script.
 *  -privKey: private key of the address that needs to sign the transaction
 *  -txobj: structured transaction that should be signed. ([]input, []output, blockHeight, blockHash)
 * */

const blockHash = '043b15eddeacc1f106b5369059ed86ad4577835be616822c7355c20480215916' // Change this!
const blockHeight = 212 // Change this!
const privKey =  zencashjs.address.WIFToPrivKey("cPN6GKDEDq4rEJtTpDRyoiVHX88U7X8CBf4WQH1m4XB6aXCF1MWj") // Change this!

var txobj = zencashjs.transaction.createRawTx( // Change this!
  [{
    txid: '767de68c6a1ab89cc253907f1c3a70ab976aaeb5e9865aa08e741c9bf8e00a74',
    vout: 1,
    scriptPubKey: '76a91469281454d9faeeddacf4aae09227575f1a80e7f688ac202362d1e7b9ffcde357d1c83e60875c7ddbd46b92c3031abb77ab0b7c8c768d0c5bb4'
  }],
  [{address: 'ztr7q2BtFydjHMCtuT7T4jRYFhevoNqmyuf', satoshis: 1000000000}],
  blockHeight,
  blockHash
)

var unsigned_serialized = zencashjs.transaction.serializeTx(txobj);
console.log("RawTx UNSIGNED: "+unsigned_serialized.toString('hex'));

const compressPubKey = true
const SIGHASH_ALL = 1
var signedobj = zencashjs.transaction.signTx(txobj, 0, privKey, compressPubKey, SIGHASH_ALL)
var signed_serialized = zencashjs.transaction.serializeTx(signedobj)
console.log("RawTx SIGNED: "+signed_serialized.toString('hex'))
