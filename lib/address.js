'use strict';

var bs58check = require('bs58check');
var secp256k1 = require('secp256k1');
var zbufferutils = require('./bufferutils');
var zcrypto = require('./crypto');
var zopcodes = require('./opcodes');
var zconfig = require('./config');

/*
 * Makes a private key
 * @param {String phrase (Password phrase)
 * @return {Sting} Private key
 */
function mkPrivKey(phrase) {
  return zcrypto.sha256(Buffer.from(phrase, 'utf-8'));
}

/*
 * Converts a private key to WIF format
 * @param {String} privKey (private key)
 * @param {boolean} toCompressed (Convert to WIF compressed key or nah)
 * @param {String} wif (wif hashing bytes (default: 0x80))
 * @return {Sting} WIF format (uncompressed)
 */
function privKeyToWIF(privKey) {
  var toCompressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var wif = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : zconfig.mainnet.wif;

  if (toCompressed) privKey = privKey + '01';

  return bs58check.encode(Buffer.from(wif + privKey, 'hex'));
}

/*
 * Returns private key's public Key
 * @param {String} privKey (private key)
 * @param {boolean} toCompressed (Convert to public key compressed key or nah)
 * @return {Sting} Public Key (default: uncompressed)
 */
function privKeyToPubKey(privKey) {
  var toCompressed = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var pkBuffer = Buffer.from(privKey, 'hex');
  var publicKey = secp256k1.publicKeyCreate(pkBuffer, toCompressed);
  return publicKey.toString('hex');
}

/*
 * Given a WIF format pk, convert it back to the original pk
 * @param {String} privKey (private key)
 * @return {Sting} Public Key (uncompressed)
 */
function WIFToPrivKey(wifPk) {
  var og = bs58check.decode(wifPk, 'hex').toString('hex');
  og = og.substr(2, og.length); // remove WIF format ('80')

  // remove the '01' at the end to 'compress it' during WIF conversion
  if (og.length > 64) {
    og = og.substr(0, 64);
  }

  return og;
}

/*
 * Converts public key to zencash address
 * @param {String} pubKey (public key)
 * @param {String} pubKeyHash (public key hash (optional, else use defaul))
 * @return {String} zencash address
 */
function pubKeyToAddr(pubKey) {
  var pubKeyHash = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : zconfig.mainnet.pubKeyHash;

  var hash160 = zcrypto.hash160(Buffer.from(pubKey, 'hex'));
  return bs58check.encode(Buffer.from(pubKeyHash + hash160, 'hex')).toString('hex');
}

/*
 * Given a list of public keys, create a M-of-N redeemscript
 * @param {[String]} pubKey (array of public keys, NOT ADDRESS)
 * @param {Int} M [2 or 3] in M-of-N multisig
 * @param {Int} N [3 or 4] in M-of-N multisig
 * @return {String} RedeemScript
 */
function mkMultiSigRedeemScript(pubKeys, M, N) {
  // https://github.com/ZencashOfficial/zen/blob/b7a7c4c4199f5e9f49868631fe5f2f6de6ba4f9a/src/script/standard.cpp#L411
  if (M > N && M <= 1) throw new Error('Invalid Multi Sig Type');
  var OP_1 = Buffer.from(zopcodes.OP_1, 'hex');
  var OP_START = (OP_1.readInt8(0) + (M - 1)).toString(16);
  var OP_END = (OP_1.readInt8(0) + (N - 1)).toString(16);

  return OP_START + pubKeys.map(function (x) {
    return zbufferutils.getStringBufferLength(x) + x;
  }).join('') + OP_END + zopcodes.OP_CHECKMULTISIG;
}

/*
 * Given the multi sig redeem script, return the corresponding address
 * @param {String} RedeemScript (redeem script)
 * @return {String} Address
 */
function multiSigRSToAddress(redeemScript) {
  // RIPEMD160(SHA256(script))
  var s256 = zcrypto.sha256(Buffer.from(redeemScript, 'hex'));
  var r160 = zcrypto.ripemd160(Buffer.from(s256, 'hex'));
  return bs58check.encode(Buffer.from(zconfig.mainnet.scriptHash + r160, 'hex'));
}

module.exports = {
  mkPrivKey: mkPrivKey,
  privKeyToWIF: privKeyToWIF,
  privKeyToPubKey: privKeyToPubKey,
  pubKeyToAddr: pubKeyToAddr,
  WIFToPrivKey: WIFToPrivKey,
  mkMultiSigRedeemScript: mkMultiSigRedeemScript,
  multiSigRSToAddress: multiSigRSToAddress
};