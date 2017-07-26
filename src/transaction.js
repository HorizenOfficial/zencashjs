// @flow
var zcrypto = require('./crypto')
var bs58check = require('bs58check')

/* Useful OP codes for the scripting language 
 * Obtained from: https://github.com/ZencashOfficial/zen/blob/master/src/script/script.h
 */
const OP_DUP = '76'
const OP_HASH160 = 'a9'
const OP_EQUALVERIFY = '88'
const OP_CHECKSIG = 'ac'
const OP_CHECKBLOCKATHEIGHT = 'b4'
const OP_EQUAL = '87'
const OP_REVERSED = '89'

/*
 * Given a hex string, get the length of it in bytes
 * ** NOT string.length, but convert it into bytes
 *    and return the length of that in bytes in hex
 * @param {String} hexStr
 * return {String} Length of hexStr in bytes
 */
function getStringBufferLength(hexStr: string): string{    
    const _tmpBuf = Buffer.from(hexStr, 'hex').length
    return Buffer.from([_tmpBuf]).toString('hex')    
}

/*
 * Given an address, generates a pubkeyhash type script needed for the transaction
 * @param {String} address
 * return {String} pubKeyScript
 */
function mkPubkeyHashScript(address: string): string{    
    var addrHex = bs58check.decode(address).toString('hex')
    var subAddrHex = addrHex.substring(4, addrHex.length) // Cut out the '00' (we also only want 14 bytes instead of 16)    
    // '14' is the length of the subAddrHex (in bytes)
    return OP_DUP + OP_HASH160 + '14' + subAddrHex + OP_EQUALVERIFY + OP_CHECKSIG    
}

/* More info: https://github.com/ZencashOfficial/zen/blob/master/src/script/standard.cpp#L377
 * Given an address, generates a pubkeyhash type script needed for the transaction
 * @param {String} address
 * return {String} pubKeyScript
 */
function mkPubkeyHashReplayScript(address: string): string{    
    var addrHex = bs58check.decode(address).toString('hex')

    // Cut out the first 4 bytes (pubKeyHash)
    var subAddrHex = addrHex.substring(4, addrHex.length)
    
    // TODO: change this so it gets block hash and height via REST API
    var blockHeight = 141340

    var blockHeightBuffer = Buffer.alloc(4)
    blockHeightBuffer.writeUInt32LE(blockHeight)
    if (blockHeightBuffer[3] === 0x00){
        var temp_buf = new Buffer(3);
        temp_buf.fill(blockHeightBuffer, 0, 3)
        blockHeightBuffer = temp_buf
    }
    var blockHeightHex = blockHeightBuffer.toString('hex')
    var blockHeightLength = getStringBufferLength(blockHeightHex)

    // Need to reverse it    
    var blockHash = '000000014a2459b17f8c2980a72751730239883bb9ac4542e5979ff951e4fa69'
    var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex')
    var blockHashLength = getStringBufferLength(blockHashHex)

    // '14' is the length of the subAddrHex (in bytes)
    return (
        OP_DUP + OP_HASH160 + '14' +
        subAddrHex + OP_EQUALVERIFY + OP_CHECKSIG +
        blockHashLength + blockHashHex + blockHeightLength +
        blockHeightHex + OP_CHECKBLOCKATHEIGHT
    )
}

/*
 * Given an address, generates a script hash type script needed for the transaction
 * @param {String} address
 * return {String} scriptHash script
 */
function mkScriptHashScript(address: string): string{    
    var addrHex = bs58check.decode(address).toString('hex')
    var subAddrHex = addrHex.substring(2, addrHex.length) // Cut out the '00' (we also only want 14 bytes instead of 16)
    // '14' is the length of the subAddrHex (in bytes)
    return OP_HASH160 + '14' + subAddrHex + OP_EQUAL    
}

/*
 * Given an address, generates an output script
 * @param {String} address
 * return {String} output script
 */
function addressToScript(address: string): string{
    // P2SH starts with a 3 | 2
    if (address[0] === '3' || address[0] === '2'){
        return mkScriptHashScript(address)
    }

    // P2PKH-replay starts with a 0
    return mkPubkeyHashReplayScript(address)
}

/*
 * Creates a raw transaction
 * @param {[object]} history, array of history in the format: [{txid: 'transaction_id', vout: vout, value: value (insatoshi), address: txout address}]
 * @param {[object]} output address on where to send coins to [{value}]
 * @param {Int} Amount of zencash to send (in satoshis)
 * @return {String} raw transaction
 */
function createRawTransaction (history: {txid: string, vout: number, value: number, address: string}[], recipients: {satoshis: number, address: string}[]) {
    var _buf = Buffer.alloc(4)
    var _buf32 = Buffer.alloc(8)

    var serialized_transaction = ''
    var txObj = {locktime: 0, version: 1, ins: [], outs: []}

    txObj.ins = history.map(function(h) {
        return {output: {hash: h.txid, vout: h.vout}, script: '', sequence: 'ffffffff'}
    })
    txObj.outs = recipients.map(function(o){
        return {script: addressToScript(o.address), satoshis: o.satoshis}
    })

    // Version    
    _buf.writeUInt16LE(txObj.version, 0)
    serialized_transaction += _buf.toString('hex')

    // History
    serialized_transaction += Buffer.from([history.length]).toString('hex')
    txObj.ins.map(function(i){        
        // Txids and vouts
        _buf.writeUInt16LE(i.output.vout, 0)
        serialized_transaction += Buffer.from(i.output.hash, 'hex').reverse().toString('hex')
        serialized_transaction += _buf.toString('hex')

        // Want the script length in bytes
        const scriptByteLength = Buffer.from(i.script, 'hex').length

        // Script                
        serialized_transaction += Buffer.from([scriptByteLength]).toString('hex')
        serialized_transaction += i.script

        // Sequence
        serialized_transaction += i.sequence
    })

    // Outputs
    serialized_transaction += Buffer.from([recipients.length]).toString('hex')
    txObj.outs.map(function(o){
        _buf32.writeUInt32LE(o.satoshis, 0)
        
        // Want the script length in bytes
        const scriptByteLength = getStringBufferLength(o.script)

        serialized_transaction += _buf32.toString('hex')
        serialized_transaction += scriptByteLength
        serialized_transaction += o.script
    })

    // Locktime
    _buf.writeUInt16LE(txObj.locktime, 0)
    serialized_transaction += _buf.toString('hex')

    return serialized_transaction
}

module.exports = {  
  mkPubkeyHashScript: mkPubkeyHashScript,
  mkPubkeyHashReplayScript: mkPubkeyHashReplayScript,
  mkScriptHashScript: mkScriptHashScript,
  addressToScript: addressToScript,
  createRawTransaction: createRawTransaction
}