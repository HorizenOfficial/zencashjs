// @flow
import type { TXOBJ, HISTORY, RECIPIENTS } from './types'

var bs58check = require('bs58check')
var elliptic = require('elliptic')
var secp256k1 = new (elliptic.ec)('secp256k1') /* eslint new-cap: ["error", { "newIsCap": false }] */
var varuint = require('varuint-bitcoin')
var zconfig = require('./config')
var zbufferutils = require('./bufferutils')
var zcrypto = require('./crypto')
var zconstants = require('./constants')
var zaddress = require('./address')
var zopcodes = require('./opcodes')
const pushdata = require('pushdata-bitcoin')

function mkNullDataReplayScript (
  data: string,
  blockHeight: number,
  blockHash: string
): string {
  var dataHex = Buffer.from(data).toString('hex')

  // Minimal encoding
  var blockHeightBuffer = Buffer.alloc(4)
  blockHeightBuffer.writeUInt32LE(blockHeight, 0)
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3)
  }
  var blockHeightHex = blockHeightBuffer.toString('hex')

  // Block hash is encoded in little indian
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex')

  return (
    zopcodes.OP_RETURN +
    zbufferutils.getPushDataLength(dataHex) +
    dataHex +
    zbufferutils.getPushDataLength(blockHashHex) +
    blockHashHex +
    zbufferutils.getPushDataLength(blockHeightHex) +
    blockHeightHex +
    zopcodes.OP_CHECKBLOCKATHEIGHT
  )
}

/*
 * Given an address, generates a pubkeyhash replay type script needed for the transaction
 * More info: https://github.com/ZencashOfficial/zen/blob/bb93453d39f86f7889e87c50f06400427a66f816/src/script/standard.cpp#L403
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * @param {String} pubKeyHash (optional)
 * return {String} pubKeyScript
 */
function mkPubkeyHashReplayScript (
  address: string,
  blockHeight: number,
  blockHash: string,
  pubKeyHash: string = zconfig.mainnet.pubKeyHash
): string {
  var addrHex = bs58check.decode(address).toString('hex')

  // Cut out pubKeyHash
  var subAddrHex = addrHex.substring(pubKeyHash.length, addrHex.length)

  // Minimal encoding
  var blockHeightBuffer = Buffer.alloc(4)
  blockHeightBuffer.writeUInt32LE(blockHeight, 0)
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3)
  }
  var blockHeightHex = blockHeightBuffer.toString('hex')

  // Block hash is encoded in little indian
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex')

  return (
    zopcodes.OP_DUP +
    zopcodes.OP_HASH160 +
    zbufferutils.getPushDataLength(subAddrHex) +
    subAddrHex +
    zopcodes.OP_EQUALVERIFY +
    zopcodes.OP_CHECKSIG +
    zbufferutils.getPushDataLength(blockHashHex) +
    blockHashHex +
    zbufferutils.getPushDataLength(blockHeightHex) +
    blockHeightHex +
    zopcodes.OP_CHECKBLOCKATHEIGHT
  )
}

/*
 * Given an address, generates a script hash replay type script needed for the transaction
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * return {String} scriptHash script
 */
function mkScriptHashReplayScript (
  address: string,
  blockHeight: number,
  blockHash: string
): string {
  var addrHex = bs58check.decode(address).toString('hex')
  var subAddrHex = addrHex.substring(4, addrHex.length) // Cut out the '00' (we also only want 14 bytes instead of 16)

  var blockHeightBuffer = Buffer.alloc(4)
  blockHeightBuffer.writeUInt32LE(blockHeight, 0)
  if (blockHeightBuffer[3] === 0x00) {
    blockHeightBuffer = blockHeightBuffer.slice(0, 3)
  }
  var blockHeightHex = blockHeightBuffer.toString('hex')

  // Block hash is encoded in little indian
  var blockHashHex = Buffer.from(blockHash, 'hex').reverse().toString('hex')

  return (
    zopcodes.OP_HASH160 +
    zbufferutils.getPushDataLength(subAddrHex) +
    subAddrHex +
    zopcodes.OP_EQUAL +
    zbufferutils.getPushDataLength(blockHashHex) +
    blockHashHex +
    zbufferutils.getPushDataLength(blockHeightHex) +
    blockHeightHex +
    zopcodes.OP_CHECKBLOCKATHEIGHT
  )
}

/*
 * Given an address, generates an output script
 * @param {String} address
 * @param {Number} blockHeight
 * @param {Number} blockHash
 * return {String} output script
 */
function addressToScript (
  address: string,
  blockHeight: number,
  blockHash: string,
  data: string
): string {
  // NULL transaction
  if (address === null || address === undefined) {
    return mkNullDataReplayScript(data, blockHeight, blockHash)
  }
  const prefix = bs58check.decode(address).toString('hex').slice(0, 4);
  // P2SH replay starts with a '2096' or '2092' prefix
  if (prefix === '2096' || prefix === '2092') {
    return mkScriptHashReplayScript(address, blockHeight, blockHash)
  }

  // P2PKH-replay is a replacement for P2PKH
  // P2PKH starts with a '2089' or '2098' prefix
  return mkPubkeyHashReplayScript(address, blockHeight, blockHash)
}

/*
 * Signature hashing for TXOBJ
 * @param {String} address
 * @param {Number} i, which transaction input to sign
 * @param {String} hex string of script
 * @param {String} hash code (SIGHASH_ALL, SIGHASH_NONE...)
 * return {String} output script
 */
function signatureForm (
  txObj: TXOBJ,
  i: number,
  script: string,
  hashcode: number
): TXOBJ {
  // Copy object so we don't rewrite it
  var newTx = JSON.parse(JSON.stringify(txObj))

  // Only sign the specified index
  for (let j = 0; j < newTx.ins.length; j++) {
    newTx.ins[j].script = ''
  }

  newTx.ins[i].script = script

  if (hashcode === zconstants.SIGHASH_NONE) {
    newTx.outs = []
  } else if (hashcode === zconstants.SIGHASH_SINGLE) {
    newTx.outs = newTx.outs.slice(0, newTx.ins.length)
    for (let j = 0; j < newTx.ins.length - 1; ++j) {
      newTx.outs[j].satoshis = Math.pow(2, 64) - 1
      newTx.outs[j].script = ''
    }
  } else if (hashcode === zconstants.SIGHASH_ANYONECANPAY) {
    newTx.ins = [newTx.ins[i]]
  }

  return newTx
}

/*
 * Deserializes a hex string into a TXOBJ
 * @param {String} hex string
 * @return {Object} txOBJ
 */
function deserializeTx (hexStr: string): TXOBJ {
  const buf = Buffer.from(hexStr, 'hex')
  var offset = 0

  // Out txobj
  var txObj = { version: 0, locktime: 0, ins: [], outs: [] }

  // Version
  txObj.version = buf.readUInt32LE(offset)
  offset += 4

  // Vins
  var vinLen = varuint.decode(buf, offset)
  offset += varuint.decode.bytes
  for (let i = 0; i < vinLen; i++) {
    // Else its
    const hash = buf.slice(offset, offset + 32)
    offset += 32

    const vout = buf.readUInt32LE(offset)
    offset += 4

    const scriptLen = varuint.decode(buf, offset)
    offset += varuint.decode.bytes

    const script = buf.slice(offset, offset + scriptLen)
    offset += scriptLen

    const sequence = buf.slice(offset, offset + 4).toString('hex')
    offset += 4

    txObj.ins.push({
      output: { hash: hash.reverse().toString('hex'), vout: vout },
      script: script.toString('hex'),
      sequence: sequence,
      prevScriptPubKey: ''
    })
  }

  // Vouts
  var voutLen = varuint.decode(buf, offset)
  offset += varuint.decode.bytes
  for (let i = 0; i < voutLen; i++) {
    const satoshis = zbufferutils.readUInt64LE(buf, offset)
    offset += 8

    const scriptLen = varuint.decode(buf, offset)
    offset += varuint.decode.bytes

    const script = buf.slice(offset, offset + scriptLen)
    offset += scriptLen

    txObj.outs.push({
      satoshis: satoshis,
      script: script.toString('hex')
    })
  }

  // Locktime
  txObj.locktime = buf.readInt32LE(offset)
  offset += 4

  return txObj
}

/*
 * Serializes a TXOBJ into hex string
 * @param {Object} txObj
 * return {String} hex string of txObj
 */
function serializeTx (txObj: TXOBJ): string {
  var serializedTx = ''
  var _buf16 = Buffer.alloc(4)

  // Version
  _buf16.writeUInt16LE(txObj.version, 0)
  serializedTx += _buf16.toString('hex')

  // History
  serializedTx += zbufferutils.numToVarInt(txObj.ins.length)
  txObj.ins.map((i) => {
    // Txids and vouts
    _buf16.writeUInt16LE(i.output.vout, 0)
    serializedTx += Buffer.from(i.output.hash, 'hex').reverse().toString('hex')
    serializedTx += _buf16.toString('hex')

    // Script Signature
    // Doesn't work for length > 253 ....
    serializedTx += zbufferutils.getPushDataLength(i.script)
    serializedTx += i.script

    // Sequence
    serializedTx += i.sequence
  })

  // Outputs
  serializedTx += zbufferutils.numToVarInt(txObj.outs.length)
  txObj.outs.map((o) => {
    // Write 64bit buffers
    // JS only supports 56 bit
    // https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/bufferutils.js#L25
    var _buf32 = Buffer.alloc(8)

    // Satoshis
    _buf32.writeInt32LE(o.satoshis & -1, 0)
    _buf32.writeUInt32LE(Math.floor(o.satoshis / 0x100000000), 4)

    // ScriptPubKey
    serializedTx += _buf32.toString('hex')
    serializedTx += zbufferutils.getPushDataLength(o.script)
    serializedTx += o.script
  })

  // Locktime
  _buf16.writeUInt16LE(txObj.locktime, 0)
  serializedTx += _buf16.toString('hex')

  return serializedTx
}

/*
 * Creates a raw transaction
 * @param {[HISTORY]} history type, array of transaction history
 * @param {[RECIPIENTS]} recipient type, array of address on where to send coins to
 * @param {Number} blockHeight (latest - 300)
 * @param {String} blockHash of blockHeight
 * @return {TXOBJ} Transction Object (see TXOBJ type for info about structure)
 */
function createRawTx (
  history: HISTORY[],
  recipients: RECIPIENTS[],
  blockHeight: number,
  blockHash: string
): TXOBJ {
  var txObj = { locktime: 0, version: 1, ins: [], outs: [] }

  txObj.ins = history.map(function (h) {
    return {
      output: { hash: h.txid, vout: h.vout },
      script: '',
      prevScriptPubKey: h.scriptPubKey,
      sequence: 'ffffffff'
    }
  })
  txObj.outs = recipients.map(function (o) {
    return {
      script: addressToScript(o.address, blockHeight, blockHash, o.data),
      satoshis: o.satoshis
    }
  })

  return txObj
}

/*
 * Gets signature for the vin script
 * @params {string} privKey private key
 * @params {TXOBJ} signingTx a txobj whereby all the vin script's field are empty except for the one that needs to be signed
 * @params {number} hashcode
*/
function getScriptSignature (
  privKey: string,
  signingTx: TXOBJ,
  hashcode: number
): string {
  // Buffer
  var _buf16 = Buffer.alloc(4)
  _buf16.writeUInt16LE(hashcode, 0)

  const signingTxHex: string = serializeTx(signingTx)
  const signingTxWithHashcode = signingTxHex + _buf16.toString('hex')

  // Sha256 it twice, according to spec
  const msg = zcrypto.sha256x2(Buffer.from(signingTxWithHashcode, 'hex'))

  // Signing it
  const rawsig = secp256k1.sign(
    Buffer.from(msg, 'hex'),
    Buffer.from(privKey, 'hex'),
    { canonical: true }
  )

  // Convert it to DER format
  // Appending 01 to it cause
  // ScriptSig = <varint of total sig length> <SIG from code, including appended 01 SIGNHASH> <length of pubkey (0x21 or 0x41)> <pubkey>
  // https://bitcoin.stackexchange.com/a/36481
  const signatureDER = Buffer.from(rawsig.toDER()).toString('hex') + '01'

  return signatureDER
}

/*
 * Signs the raw transaction
 * @param {String} rawTx raw transaction
 * @param {Int} i
 * @param {privKey} privKey (not WIF format)
 * @param {compressPubKey} compress public key before appending to scriptSig? (default false)
 * @param {hashcode} hashcode (default SIGHASH_ALL)
 * return {String} signed transaction
 */
function signTx (
  _txObj: TXOBJ,
  i: number,
  privKey: string,
  compressPubKey: boolean = false,
  hashcode: number = zconstants.SIGHASH_ALL
): TXOBJ {
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj))

  // Prepare our signature
  // Get script from the current tx input
  const script = txObj.ins[i].prevScriptPubKey

  // Populate current tx in with the prevScriptPubKey
  const signingTx: TXOBJ = signatureForm(txObj, i, script, hashcode)

  // Get script signature
  const scriptSig = getScriptSignature(privKey, signingTx, hashcode)

  // Chuck it back into txObj and add pubkey
  // Protocol:
  // PUSHDATA
  // signature data and SIGHASH_ALL
  // PUSHDATA
  // public key data
  const pubKey = zaddress.privKeyToPubKey(privKey, compressPubKey)

  txObj.ins[i].script =
    zbufferutils.getPushDataLength(scriptSig) +
    scriptSig +
    zbufferutils.getPushDataLength(pubKey) +
    pubKey

  return txObj
}

/*
 * Gets signatures needed for multi-sign tx
 * @param {String} _txObj transaction object you wanna sign
 * @param {Int} index fof tx.in to sign
 * @param {privKey} One of the M private keys you (NOT WIF format!!!)
 * @param {string} redeemScript (redeemScript of the multi-sig)
 * @param {string} hashcode (SIGHASH_ALL, SIGHASH_NONE, etc)
 * return {String} signature
 */
function multiSign (
  _txObj: TXOBJ,
  i: number,
  privKey: string,
  redeemScript: string,
  hashcode: number = zconstants.SIGHASH_ALL
): string {
  // Make a copy
  var txObj = JSON.parse(JSON.stringify(_txObj))

  // Populate current tx.ins[i] with the redeemScript
  const signingTx: TXOBJ = signatureForm(txObj, i, redeemScript, hashcode)

  return getScriptSignature(privKey, signingTx, hashcode)
}

function txToMsg (_txObj, i, redeemScript, hashcode) {
  const txObj = JSON.parse(JSON.stringify(_txObj))

  // Populate current tx.ins[i] with the redeemScript
  const signingTx = signatureForm(txObj, i, redeemScript, hashcode)
  // Buffer
  const _buf16 = Buffer.alloc(4)
  _buf16.writeUInt16LE(hashcode, 0)

  const signingTxHex = serializeTx(signingTx)
  const signingTxWithHashcode = signingTxHex + _buf16.toString('hex')

  // Sha256 it twice, according to spec
  const msg = zcrypto.sha256x2(Buffer.from(signingTxWithHashcode, 'hex'))

  return msg
}
/*
 * Applies the signatures to the transaction object
 * NOTE: You NEED to supply the signatures in order.
 *       E.g. You made sigAddr1 with priv1, priv3, priv2
 *            You can provide signatures of (priv1, priv2) (priv3, priv2) ...
 *            But not (priv2, priv1)
 * @param {String} _txObj transaction object you wanna sign
 * @param {Int} index fof tx.in to sign
 * @param {[string]} signatures obtained from multiSign
 * @param {string} redeemScript (redeemScript of the multi-sig)
 * @param {string} hashcode (SIGHASH_ALL, SIGHASH_NONE, etc)
 * return {String} signature
 */
function applyMultiSignatures (
  _txObj: TXOBJ,
  i: number,
  signatures: [string],
  redeemScript: string,
  hashcode: number = zconstants.SIGHASH_ALL
): TXOBJ {
  // Make a copy
  const txObj = JSON.parse(JSON.stringify(_txObj))

  let rsFixed = redeemScript.slice(2)
  let pubKeys = []

  // 30 was chosen arbitrarily as the minimum length
  // of a pubkey is 33
  while (rsFixed.length > 30) {
    // Convert pushdatalength from hex to int
    // Extract public key
    const pushDataLength = parseInt(rsFixed.slice(0, 2), 16).toString(10)
    const pubkey = Buffer.from(rsFixed.slice(2), 'hex').slice(0, pushDataLength).toString('hex')
    pubKeys = pubKeys.concat(pubkey)

    rsFixed = rsFixed.slice(2 + pubkey.length)
  }

  let allSigs = signatures.slice()
  // extract applied signatures
  if (txObj.ins[i].script.length > 0) {
    const prevSigs = []
    const script = txObj.ins[i].script
    const removedScriptSig = script.replace(redeemScript, '')
    const removedTrails = removedScriptSig.slice(2, -4)
    let sigs = removedTrails

    while (sigs.length > 0) {
      const sigLen = parseInt(sigs.slice(0, 2), 16).toString(10)
      const sig = Buffer.from(sigs.slice(2), 'hex').slice(0, sigLen).toString('hex')
      prevSigs.push(sig)
      sigs = sigs.slice(2 + sig.length)
    }
    const newSigs = signatures.filter(sig => prevSigs.indexOf(sig) < 0)
    allSigs = newSigs.concat(prevSigs)
  }

  // Fix signature order
  let unmatched = JSON.parse(JSON.stringify(allSigs))
  const orderedSigs = []
  pubKeys.map(pubKey => {
    const keyPair = secp256k1.keyFromPublic(pubKey, 'hex')
    const msg = txToMsg(txObj, i, redeemScript, hashcode)
    let match
    unmatched.some((sig, i) => {
      if (!sig) return false
      const ver = keyPair.verify(msg, Buffer.from(sig, 'hex').slice(0, -1))

      if (!ver) {
        return false
      }

      unmatched[i] = undefined
      match = sig
      return true
    })

    if (match) {
      orderedSigs.push(match)
    }

    return match
  })

  const redeemScriptLenght = Buffer.from(redeemScript, 'hex').length
  const pushDataBuffer = Buffer.alloc(pushdata.encodingLength(redeemScriptLenght))
  pushdata.encode(pushDataBuffer, redeemScriptLenght, 0)

  // http://www.soroushjp.com/2014/12/20/bitcoin-multisig-the-hard-way-understanding-raw-multisignature-bitcoin-transactions/
  txObj.ins[i].script =
    zopcodes.OP_0 +
    orderedSigs.map((x) => {
      return zbufferutils.getPushDataLength(x) + x
    }).join('') +
    pushDataBuffer.toString('hex') +
    redeemScript

  return txObj
}

module.exports = {
  addressToScript: addressToScript,
  createRawTx: createRawTx,
  mkPubkeyHashReplayScript: mkPubkeyHashReplayScript,
  mkScriptHashReplayScript: mkScriptHashReplayScript,
  signatureForm: signatureForm,
  serializeTx: serializeTx,
  deserializeTx: deserializeTx,
  signTx: signTx,
  multiSign: multiSign,
  applyMultiSignatures: applyMultiSignatures,
  getScriptSignature: getScriptSignature,
  mkNullDataReplayScript: mkNullDataReplayScript
}
