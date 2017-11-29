// @flow
var varuint = require('varuint-bitcoin')

// https://github.com/bitcoinjs/bitcoinjs-lib/issues/14
function numToBytes (num: number, bytes: number) {
  if (bytes === 0) return []
  else return [num % 256].concat(numToBytes(Math.floor(num / 256), bytes - 1))
}

function numToVarInt (num: number): string {
  return varuint.encode(num).toString('hex')
}

// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint (value: number, max: number) {
  if (typeof value !== 'number') {
    throw new Error('cannot write a non-number as a number')
  }
  if (value < 0) {
    throw new Error('specified a negative value for writing an unsigned value')
  }
  if (value > max) throw new Error('RangeError: value out of range')
  if (Math.floor(value) !== value) {
    throw new Error('value has a fractional component')
  }
}

function readUInt64LE (buffer: Buffer, offset: number) {
  var a = buffer.readUInt32LE(offset)
  var b = buffer.readUInt32LE(offset + 4)
  b *= 0x100000000

  verifuint(b + a, 0x001fffffffffffff)

  return b + a
}

function writeUInt64LE (buffer: Buffer, value: number, offset: number) {
  verifuint(value, 0x001fffffffffffff)

  buffer.writeInt32LE(value & -1, offset)
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4)
  return offset + 8
}

/*
 * Given a hex string, get the length of it in bytes
 * ** NOT string.length, but convert it into bytes
 *    and return the length of that in bytes in hex
 * @param {String} hexStr
 * return {String} Length of hexStr in bytes
 */
function getPushDataLength (s: string): string {
  // https://en.bitcoin.it/wiki/Protocol_documentation#Variable_length_integer
  const hexLength = Buffer.from(s, 'hex').length
  return numToVarInt(hexLength)
}

module.exports = {
  readUInt64LE: readUInt64LE,
  writeUInt64LE: writeUInt64LE,
  getPushDataLength: getPushDataLength,
  numToVarInt: numToVarInt,
  numToBytes: numToBytes
}
