/* @flow
 * Obtained from https://github.com/bitcoinjs/bitcoinjs-lib/blob/master/src/crypto.js
 * 2017/07/25: No ripemd160 in SJCL, so resorted to this
 */

var createHash = require('create-hash')

function ripemd160 (buffer: Buffer): string {
  return createHash('rmd160').update(buffer).digest('hex')
}

function sha1 (buffer: Buffer): string {
  return createHash('sha1').update(buffer).digest('hex')
}

function sha256 (buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

function sha256x2 (buffer: Buffer): string {
  return sha256(Buffer.from(sha256(buffer), 'hex'))
}

// Man fuck these string and buffer 
// non deterministic functions. I need types.
function sha256x2_str (s: string): string {
  return sha256(Buffer.from(sha256(s), 'hex'))
}

function hash160 (buffer: Buffer): string {
  const sha = sha256(buffer)
  const hash160 = ripemd160(Buffer.from(sha, 'hex'))
  return hash160
}

module.exports = {
  hash160: hash160,
  ripemd160: ripemd160,
  sha1: sha1,
  sha256: sha256,
  sha256x2: sha256x2,
  sha256x2_str: sha256x2_str
}
