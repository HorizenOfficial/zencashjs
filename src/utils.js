var bs58check = require('bs58check')
var sjcl = require('sjcl')
var zconfig = require('./config')

module.exports = {
  /*
   * Creates a 256bit long private key
   * @param {String} secret
   * @return {String} privateKey in Hex
   */
  sha256: secret => {
    var salt = sjcl.hash.sha256.hash(secret)
    return sjcl.codec.hex.fromBits(salt)
  },

  /*
   * Converts a private key to WIF format
   * @param {String} pk
   * @return {Sting} WIF format
   */
  privKeyToWIF: pk => {
    var pkAndVer = zconfig.pubKeyHash + pk
    var sha1 = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(pkAndVer))
    var sha2 = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(sha1))
    var checksum = sha2.substr(0, 8).toUpperCase()
    return bs58check.encode(pkAndVer + checksum)
  },

  /*
   * Converts a private key to a public key
   * @param {String} pk
   * @return {Sting} publicKey
   */
  privKeyToPub: pk => {

  }  
}
