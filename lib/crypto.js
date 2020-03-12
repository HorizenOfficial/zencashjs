"use strict";

var _module$exports;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/* 
 * Obtained from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/crypto.js
 * 2017/07/25: No ripemd160 in SJCL, so resorted to this
 */
var createHash = require('create-hash');

function ripemd160(buffer) {
  return createHash('rmd160').update(buffer).digest('hex');
}

function sha1(buffer) {
  return createHash('sha1').update(buffer).digest('hex');
}

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function sha256x2(buffer) {
  return sha256(Buffer.from(sha256(buffer), 'hex'));
}

function hash160(buffer) {
  var sha = sha256(buffer);
  var hash160 = ripemd160(Buffer.from(sha, 'hex'));
  return hash160;
}

function sha256Buf(buffer) {
  return createHash('sha256').update(buffer).digest();
}

function hash256Buf(buffer) {
  return sha256Buf(sha256Buf(buffer));
}

function hash160Buf(buffer) {
  return createHash('ripemd160').update(sha256Buf(buffer)).digest();
}

module.exports = (_module$exports = {
  hash160: hash160,
  ripemd160: ripemd160,
  sha1: sha1,
  sha256: sha256,
  sha256x2: sha256x2
}, _defineProperty(_module$exports, "sha256x2", sha256x2), _defineProperty(_module$exports, "hash256Buf", hash256Buf), _defineProperty(_module$exports, "hash160Buf", hash160Buf), _module$exports);