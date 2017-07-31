/*
config.js - Configuration for ZENCash Coin
*/

module.exports = {
  messagePrefix: '\x20ZENCash Magic Numbers:\n',
  bip32: {
    public: '0488b21e',
    private: '0488ade4'
  },
  pubKeyHash: '2089',
  zcPaymentAddressHash: '169a', // Private z-address
  zcSpendingKeyHash: 'ab36', // Spending key
  scriptHash: '2096',
  wif: '80'
};