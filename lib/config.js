/*
config.js - Configuration for ZENCash Coin
*/

module.exports = {
  mainnet: {
    messagePrefix: 'ZENCash main net',
    bip32: {
      public: '0488b21e',
      private: '0488ade4'
    },
    pubKeyHash: '2089',
    scriptHash: '2096',
    zcPaymentAddressHash: '169a', // Private z-address
    zcSpendingKeyHash: 'ab36', // Spending key  
    wif: '80'
  },

  testnet: {
    testnetWif: 'ef',
    testnetPubKeyHash: '2098'
  }
};