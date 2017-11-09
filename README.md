# zencashjs ![build status](https://api.travis-ci.org/ZencashOfficial/zencashjs.svg?branch=master)
Dead simple and easy to use JavaScript based library for zencash. Inspired by [pybitcointools](https://github.com/vbuterin/pybitcointools)

# Example usage (Transparent address)
```javascript
var zencashjs = require('zencashjs')

var priv = zencashjs.address.mkPrivKey('chris p. bacon, defender of the guardians')
// 2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c

var privWIF = zencashjs.address.privKeyToWIF(priv)
// 5J9mKPd531Tk4A73kKp4iowoi6EvhEp8QSMAVzrZhuzZkdpYbK8

var pubKey = zencashjs.address.privKeyToPubKey(priv)
// 048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad

var zAddr = zencashjs.address.pubKeyToAddr(pubKey)
// znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf

// To create and sign a raw transaction at BLOCKHEIGHT and BLOCKHASH
const blockHeight = 142091
const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'

var txobj = zencashjs.transaction.createRawTx(
  [{
      txid: '196173ec34d22a52cc689a21d01dd33b633671cbe1141e7e66240c7f3b4ccf7b', vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b4'
  }],
  [{address: 'znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf', satoshis: 100000}],
  blockHeight,
  blockHash
)
// zencashjs.transaction.serializeTx(txobj)
// 01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000

var tx0 = zencashjs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c')
// zencashjs.transaction.serializeTx(tx0)
// 01000000017bcf4c3b7f0c24667e1e14e1cb7136633bd31dd0219a68cc522ad234ec736119000000008b483045022100b69baff0eb5570fd8ddda7b180463035d47eb3b1c07a808a68085fd58e9e22b102202eb3983a2137af4f8c3967b3c6c16c024ad952a712ab92b8911a8797f1864d3d0141048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aadffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000

// You can now do zen-cli sendrawtransaction `SERIALIZED_TRANSACTION`
```

# Example Usage (Multi-sig)
```javascript
var zencashjs = require('zencashjs')

// Private keys in wallet import format
var privKeysWIF = ['L2sjwCsdZQmckKkTKGDqhKcWtbe3EU2FL4N1YHpD2SC1GhHRhqxF', 'L5bpskJWAGGWR1GA9SJkCQ2ndHkezqm8GuoWaBesrrwnsa1roSN6',
'KxvE58rxEwckkCjemDVdMDp7wzgosnyX1oyjzWmrcAVpV7EaZdSP']

// Converts Private keys in WIF to its original form
var privKeys = privKeysWIF.map((x) => zencashjs.address.WIFToPrivKey(x))
// [ '03519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd487', '02d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a616544', '02696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e' ]

// Get public keys (NOT address)
var pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))
// [ '03519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd487', '02d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a616544', '02696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e' ]

// Make a 2-of-3 multisig address
// NOTE: The redeemScript determines the order of your signatures for multisign
//       E.g. I made an address with pk1, pk3, pk2 for a 2-of-3 multisig
//            Valid Sigs: [pk1, pk2] OR [pk3, pk2] OR [pk1, pk3] ...
//            Invalid Sigs: [pk3, pk1], [pk2, pk1]
var redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 3)
// 522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae

var multiSigAddress = zencashjs.address.multiSigRSToAddress(redeemScript)
// zsmSCni8GXoCdTGqUfn26QJVGh6rpaFs17T

// To create and sign a raw transaction at BLOCKHEIGHT and BLOCKHASH
const blockHeight = 142091
const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'

var txobj = zencashjs.transaction.createRawTx(
  [{
      txid: 'f5f324064de9caab9353674c59f1c3987ca997bf5882a41a722686883e089581', vout: 0,
      scriptPubKey: '' // DOn't need script pub key since we'll be using redeemScript to sign
  }],
  [{address: 'zneng6nRqTrqTKfjYAqXT86HWtk96ftPjtX', satoshis: 10000}],
  blockHeight,
  blockHash
)

// Prepare our signatures for mutli-sig
var sig1 = zencashjs.transaction.multiSign(txobj, 0, privKeys[0], redeemScript)
// 3045022100c65ec438dc13028b1328a0f8426e1970ef202cba168772fe9d91d141e3020413022021b038c2098c29014aa7feef1624c3d9e4035ca960791f3bbe256df9f008038d01

var sig2 = zencashjs.transaction.multiSign(txobj, 0, privKeys[1], redeemScript)
// 3045022100c65ec438dc13028b1328a0f8426e1970ef202cba168772fe9d91d141e3020413022021b038c2098c29014aa7feef1624c3d9e4035ca960791f3bbe256df9f008038d01

// NOTE: If you wanna send the tx to someone to get their signature, you can serialize the txObj and send it over in bytes, they can also deserialize it: e.g.
// var txBytes = zencashjs.transaction.serializeTx(txobj)
// var txObj = zencashjs.transaction.deserializeTx(txBytes)

// Apply the signatures to the transaction object
var tx0 = zencashjs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

// Serialize the transaction
var serializedTx = zencashjs.transaction.serializeTx(tx0)

// You can now send the serializedTx using the RPC command sendrawtransaction or through an API like insight
```

# Example usage (Private address)
```javascript
var zencashjs = require('zencashjs')

var z_secretKey = zencashjs.zaddress.mkZSecretKey('Z pigs likes to snooze. ZZZZ')
// 0c10a61a669bc4a51000c4c74ff58c151912889891089f7bae5e4994a73af7a8

// Spending key (this is what you import into your wallet)
var spendingKey = zencashjs.zaddress.zSecretKeyToSpendingKey(z_secretKey)
// SKxtHJsneoLByrwME9Nh4cd4AvYLNK9jJkAnB3AHNW794udD1qpx

// Paying key
var a_pk = zencashjs.zaddress.zSecretKeyToPayingKey(z_secretKey)
// 927a3819627247c0dd39102ec5449fc6fc952e242aad08615df9f26718912e27

// Transmission key
var pk_enc = zencashjs.zaddress.zSecretKeyToTransmissionKey(z_secretKey)
// 22d666c34ababacf6a9a4a752cc7870b505b64e85638aa45d23ac32992397960

var Zaddress = zencashjs.zaddress.mkZAddress(a_pk, pk_enc)
// zcTPZR8Hqz2ZcStwMJju9L4VBHW7YWmNyL6tDAT4eVmzmxLaG7h4QmqUXfmrjz8twizH4piDGiRYJRZ1bhHhT5gFL6TKsQZ
```


# Development guide (more to come..)
```bash
# src is where the source code resides.
# lib is where the transpiled code resides in.
# edit src if you wanna make a PR
git clone https://github.com/ZencashOfficial/zencashjs.git
cd zencashjs
yarn install
yarn run [dev | build]
```
