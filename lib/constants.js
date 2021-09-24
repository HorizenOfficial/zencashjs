"use strict";

module.exports = {
  /* SIGHASH Codes
   * Obtained from: https://github.com/HorizenOfficial/zen/blob/master/src/script/interpreter.h
   */
  SIGHASH_ALL: 1,
  SIGHASH_NONE: 2,
  SIGHASH_SINGLE: 3,
  SIGHASH_ANYONECANPAY: 0x80,
  TX_VERSION_CERTIFICATE: -5,
  TX_VERSION_SIDECHAIN: -4
};