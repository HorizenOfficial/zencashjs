

// https://github.com/bitcoinjs/bitcoinjs-lib/issues/14
function numToBytes(num, bytes) {
  if (bytes == 0) return [];else return [num % 256].concat(numToBytes(Math.floor(num / 256), bytes - 1));
}

function numToVarInt(num) {
  var b;
  if (num < 253) b = [num];else if (num < 65536) b = [253].concat(numToBytes(num, 2));else if (num < 4294967296) b = [254].concat(numToBytes(num, 4));else b = [253].concat(numToBytes(num, 8));
  return Buffer.from(b).toString('hex');
}

// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint(value, max) {
  if (typeof value !== 'number') {
    throw new Error('cannot write a non-number as a number');
  }
  if (value < 0) {
    throw new Error('specified a negative value for writing an unsigned value');
  }
  if (value > max) throw new Error('RangeError: value out of range');
  if (Math.floor(value) !== value) {
    throw new Error('value has a fractional component');
  }
}

function readUInt64LE(buffer, offset) {
  var a = buffer.readUInt32LE(offset);
  var b = buffer.readUInt32LE(offset + 4);
  b *= 0x100000000;

  verifuint(b + a, 0x001fffffffffffff);

  return b + a;
}

function writeUInt64LE(buffer, value, offset) {
  verifuint(value, 0x001fffffffffffff);

  buffer.writeInt32LE(value & -1, offset);
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
  return offset + 8;
}

/*
 * Given a hex string, get the length of it in bytes
 * ** NOT string.length, but convert it into bytes
 *    and return the length of that in bytes in hex
 * @param {String} hexStr
 * return {String} Length of hexStr in bytes
 */
function getStringBufferLength(hexStr) {
  const _tmpBuf = Buffer.from(hexStr, 'hex').length;
  return Buffer.from([_tmpBuf]).toString('hex');
}

module.exports = {
  readUInt64LE: readUInt64LE,
  writeUInt64LE: writeUInt64LE,
  getStringBufferLength: getStringBufferLength,
  numToVarInt: numToVarInt,
  numToBytes: numToBytes
};