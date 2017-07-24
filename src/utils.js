var bs58 = require('bs58')
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
  return sha256(sha256(buffer))
}

/*
 * Converts a private key to WIF format
 * @param {String} pk (private key)
 * @return {Sting} WIF format
 */
function privKeyToWIF (pk) {
  var pkAndVer = zconfig.wif + pk
  var checksum = sha256x2(pkAndVer).substr(0, 8)
  return bs58.encode(Buffer.from(pkAndVer + checksum, 'hex'))
}

/*
 * Returns private key's public Key
 * @param {String} pk (private key)
 * @return {Sting} Public Key
 */
function privKeyToPubKey (pk) {
  var ecparams = ecurve.getCurveByName('secp256k1')
  var curvePt = ecparams.G.multiply(bigi.fromBuffer(pk))
  var x = curvePt.affineX
  var y = curvePt.affineY
  var publicKey = Buffer.concat([Buffer.from([0x04]), x.toBuffer(32), y.toBuffer(32)])
  return publicKey.toString('hex')
}

/*
 * Converts public key to zencash address
 * @param {String} pk (public key)
 * @return {Sting} zencash address
 */
function pubKeyToAddr (pk) {
  var hash160 = ripemd160(pk)
  var version = '0' // if using testnet, would use 0x6F or 111.
  var verAndHash = version + hash160
  var doublesha = sha256x2(verAndHash)
  var checksum = doublesha.substr(0, 8)
  var unencodedaddress = zconfig.pubKeyHash + hash160 + checksum
  return bs58.encode(Buffer.from(unencodedaddress, 'hex'))
}

module.exports = {
  sha256: sha256,
  sha256x2: sha256x2,
  ripemd160: ripemd160,
  privKeyToWIF: privKeyToWIF,
  privKeyToPubKey: privKeyToPubKey,
  pubKeyToAddr: pubKeyToAddr
}
