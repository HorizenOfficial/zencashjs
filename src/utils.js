// @flow
var zcrypto = require('./crypto')
var bs58check = require('bs58check')
var zconfig = require('./config')
var ecurve = require('ecurve')
var bigi = require('bigi')

/*
 * Converts a private key to WIF format
 * @param {String} privKey (private key)
 * @return {Sting} WIF format (uncompressed) 
 */
function makePrivKey (phrase: string) {  
  return zcrypto.sha256(Buffer.from(phrase, 'utf-8'))
}

/*
 * Converts a private key to WIF format
 * @param {String} privKey (private key)
 * @return {Sting} WIF format (uncompressed) 
 */
function privKeyToWIF (privKey: string) {
  // Add '01' from the end if you want the compressed version
  return bs58check.encode(Buffer.from(zconfig.wif + privKey, 'hex'))
}

/*
 * Returns private key's public Key
 * @param {String} privKey (private key)
 * @return {Sting} Public Key (uncompressed)
 */
function privKeyToPubKey (privKey: string) {
  const pkBuffer = Buffer.from(privKey, 'hex')
  var ecparams = ecurve.getCurveByName('secp256k1')
  var curvePt = ecparams.G.multiply(bigi.fromBuffer(pkBuffer))
  var publicKey = curvePt.getEncoded(false) //true forces compressed public key
  return publicKey.toString('hex')
}

/*
 * Converts public key to zencash address
 * @param {String} pubKey (public key)
 * @return {Sting} zencash address
 */
function pubKeyToAddr (pubKey: string) {
  const hash160 = zcrypto.hash160(Buffer.from(pubKey, 'hex'))
  return bs58check.encode(Buffer.from(zconfig.pubKeyHash +  hash160, 'hex')).toString('hex')
}


module.exports = {
  makePrivKey: makePrivKey,  
  privKeyToWIF: privKeyToWIF,
  privKeyToPubKey: privKeyToPubKey,
  pubKeyToAddr: pubKeyToAddr  
}