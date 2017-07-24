var bs58check = require('bs58check')
var Zripemd160 = require('ripemd160')
var sjcl = require('sjcl')
var zconfig = require('./config')
var ecurve = require('ecurve')
var bigi = require('bigi')

/*
 * Applies ripemd160 on the buffer.
 * @param {String} buffer
 * @return {String} hashed output
 */
function ripemd160 (buffer) {
  return new Zripemd160().update(buffer).digest('hex')
}

/*
 * Applies SHA256 on the buffer. (Use this to get private key)
 * @param {String} buffer
 * @return {String} sha256 hash of buffer
 */
function sha256 (buffer) {
  var salt = sjcl.hash.sha256.hash(buffer)
  return sjcl.codec.hex.fromBits(salt)
}

/*
 * Applies SHA256 on the buffer twice.
 * @param {String} buffer
 * @return {String} sha256 hash of the sha256 hash of the buffer
 */
function sha256x2 (buffer) {
  var t = sha256(buffer)
  return sha256(t)
}

/*
 * Converts a private key to WIF format
 * @param {String} pk (private key)
 * @return {Sting} WIF format (hex compressed)
 */
function privKeyToWIF (pk) {
  // Remove '01' from the end if you don't want the compressed version
  return bs58check.encode(Buffer.from(zconfig.wif + pk + '01', 'hex'))
}

/*
 * Returns private key's public Key
 * @param {String} pk (private key)
 * @return {Sting} Public Key (uncompressed)
 */
function privKeyToPubKey (pk) {
  var ecparams = ecurve.getCurveByName('secp256k1')
  var curvePt = ecparams.G.multiply(bigi.fromBuffer(pk))
  var x = curvePt.affineX
  var y = curvePt.affineY
  var publicKey = Buffer.concat([
    Buffer.from('04', 'hex'),
    x.toBuffer(32),
    y.toBuffer(32)
  ])
  return publicKey.toString('hex')
}

/*
 * Converts public key to zencash address
 * @param {String} pk (public key)
 * @return {Sting} zencash address
 */
function pubKeyToAddr (pk) {
  var hash160 = ripemd160(pk)
  return bs58check.encode(Buffer.from(zconfig.pubKeyHash + hash160, 'hex'))
}

module.exports = {
  sha256: sha256,
  sha256x2: sha256x2,
  ripemd160: ripemd160,
  privKeyToWIF: privKeyToWIF,
  privKeyToPubKey: privKeyToPubKey,
  pubKeyToAddr: pubKeyToAddr
}
