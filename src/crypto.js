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

function hash160 (buffer: Buffer): string {
  const sha = sha256(buffer)
  const hash160 = ripemd160(Buffer.from(sha, 'hex'))
  return hash160
}

function sha256Buf (buffer: Buffer): Buffer{
  return createHash('sha256')
    .update(buffer)
    .digest()
}

function hash256Buf (buffer: Buffer): Buffer {
  return sha256Buf(sha256Buf(buffer))
}

function hash160Buf (buffer: Buffer): Buffer {
  return createHash('ripemd160')
    .update(sha256Buf(buffer))
    .digest()
}

module.exports = {
  hash160: hash160,
  ripemd160: ripemd160,
  sha1: sha1,
  sha256: sha256,
  sha256x2: sha256x2,
  sha256x2: sha256x2,
  hash256Buf: hash256Buf,
  hash160Buf: hash160Buf
}
