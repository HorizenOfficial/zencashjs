const bs58check = require('bs58check')
const secp256k1 = require('secp256k1')
const zcrypto = require('./crypto');
const varuint = require('varuint-bitcoin')

/**
 * Will sign a message with a given zen private key.
 *
 * @param {string} message - The message to be signed
 * @param {string} privateKey - A private key
 * @param {Boolean} compressed
 * @returns {Buffer} The signature
 */
function sign(message: string, privateKey: string, compressed: Boolean, sigOptions) :string {
  let { extraEntropy } = sigOptions || {}
  const hash = _magicHash(message, false)
  const sigObj = secp256k1.sign(hash, Buffer.from(privateKey, 'hex'), { data: extraEntropy })
  return encodeSignature(
    sigObj.signature,
    sigObj.recovery,
    compressed
  );
}

/**
 * Validate a signature against a given zend address.
 *
 * @param {String} message - the message to verify
 * @param {String} zenAddress - A zen address
 * @param {String|Buffer} signature - A base64 encoded compact signature
 * @returns {Boolean} true if the signature is valid
 */
function verify(message: string, zenAddress: string, signature: string|Buffer) : Boolean {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')
  const parsed = decodeSignature(signature)
  const hash = _magicHash(message, false)
  const publicKey = secp256k1.recover(
    hash,
    parsed.signature,
    parsed.recovery,
    parsed.compressed
  )
  const publicKeyHash = zcrypto.hash160Buf(publicKey)
  let actual, expected
  actual = publicKeyHash
  // prefix is 2 bytes in zencash instead of 1 
  expected = bs58check.decode(zenAddress).slice(2)
  return (expected.equals(actual)); 
}

function encodeSignature (signature, recovery, compressed) {
  if (compressed) recovery += 4
  return Buffer.concat([Buffer.alloc(1, recovery + 27), signature])
}

function decodeSignature (buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')
  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter')
  }
  return {
    compressed: !!(flagByte & 12),
    recovery: flagByte & 3,
    signature: buffer.slice(1)
  }
}

function _magicHash(message) {
  const MAGIC_BYTES = new Buffer('Zcash Signed Message:\n');
  var prefix1 = varuint.encode(MAGIC_BYTES.length);
  var messageBuffer = new Buffer(message);
  var prefix2 = varuint.encode(messageBuffer.length);
  var buf = Buffer.concat([prefix1, MAGIC_BYTES, prefix2, messageBuffer]);
  return zcrypto.hash256Buf(buf)
}

module.exports = {
  sign: sign,
  verify: verify,
}
