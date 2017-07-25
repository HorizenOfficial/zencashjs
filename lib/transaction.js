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
const OP_EQUAL = '87';

/*
 * Given an address, generates a pubkeyhash type script needed for the transaction
 * @param {String} address
 * return {String} pubKeyScript
 */
function mkPubkeyHashScript(address) {
    var addrHex = bs58check.decode(address).toString('hex');
    var subAddrHex = addrHex.substring(2, addrHex.length); // Cut out the '00' (we also only want 14 bytes instead of 16)
    // '14' is the length of the subAddrHex (in bytes)
    return OP_DUP + OP_HASH160 + '14' + subAddrHex + OP_EQUALVERIFY + OP_CHECKSIG;
}

/*
 * Given an address, generates a script hash type script needed for the transaction
 * @param {String} address
 * return {String} scriptHash script
 */
function mkScriptHashScript(address) {
    var addrHex = bs58check.decode(address).toString('hex');
    var subAddrHex = addrHex.substring(2, addrHex.length); // Cut out the '00' (we also only want 14 bytes instead of 16)
    // '14' is the length of the subAddrHex (in bytes)
    return OP_HASH160 + '14' + subAddrHex + OP_EQUAL;
}

/*
 * Given an address, generates an output script
 * @param {String} address
 * return {String} output script
 */
function addressToScript(address) {
    // P2SH starts with a 3 | 2
    if (address[0] === '3' || address[0] === '2') {
        return mkScriptHashScript(address);
    }

    // P2PKH starts with a 0
    return mkPubkeyHashScript(address);
}

/*
 * Creates a raw transaction
 * @param {[object]} history, array of history in the format: [{txid: 'transaction_id', vout: vout, value: value (insatoshi), address: txout address}]
 * @param {[object]} output address on where to send coins to [{value}]
 * @param {Int} Amount of zencash to send (in satoshis)
 * @return {String} raw transaction
 */
function createRawTranscation(history, recipients) {
    var _buf = Buffer.alloc(4);
    var _buf32 = Buffer.alloc(8);

    var serialized_transaction = '';
    var txObj = { locktime: 0, version: 1, ins: [], outs: [] };

    txObj.ins = history.map(function (h) {
        return { output: { hash: h.txid, vout: h.vout }, script: '', sequence: 'ffffffff' };
    });
    txObj.outs = recipients.map(function (o) {
        return { script: addressToScript(o.address), satoshis: o.satoshis };
    });

    // Version    
    _buf.writeUInt16LE(txObj.version, 0);
    serialized_transaction += _buf.toString('hex');

    // History
    serialized_transaction += Buffer.from([history.length]).toString('hex');
    txObj.ins.map(function (i) {
        // Txids and vouts
        _buf.writeUInt16LE(i.output.vout, 0);
        serialized_transaction += Buffer.from(i.output.hash, 'hex').reverse().toString('hex');
        serialized_transaction += _buf.toString('hex');

        // Want the script length in bytes
        const scriptByteLength = Buffer.from(i.script, 'hex').length;
        // Script                

        serialized_transaction += Buffer.from([scriptByteLength]).toString('hex');
        serialized_transaction += i.script;

        // Sequence
        serialized_transaction += i.sequence;
    });

    // Outputs
    serialized_transaction += Buffer.from([recipients.length]).toString('hex');
    txObj.outs.map(function (o) {
        _buf32.writeUInt32LE(o.satoshis, 0);

        // Want the script length in bytes
        const scriptByteLength = Buffer.from(o.script, 'hex').length;

        serialized_transaction += _buf32.toString('hex');
        serialized_transaction += Buffer.from([scriptByteLength]).toString('hex');
        serialized_transaction += o.script;
    });

    // Locktime
    _buf.writeUInt16LE(txObj.locktime, 0);
    serialized_transaction += _buf.toString('hex');

    return serialized_transaction;
}

module.exports = {
    createRawTranscationv: createRawTranscation,
    mkPubkeyHashScript: mkPubkeyHashScript,
    mkScriptHashScript: mkScriptHashScript,
    addressToScript: addressToScript,
    createRawTranscation: createRawTranscation
};