/*
config.js - Configuration for your coin
To convert between bytes and hex do:
Buffer([0x2096]).toString('hex') // Example for script hash
*/

module.exports = {
  messagePrefix: '\x20ZENCash Magic Numbers:\n',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4
  },
  pubKeyHash: 0x2089,
  scriptHash: '96', // 0x2096
  wif: 0x80
}
