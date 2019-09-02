var zencashjs = require('..')
var chai = require('chai')
var expect = chai.expect

it('serializeTx() and desrializeTx() should be deterministic', function () {
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'
  const blockHeight = 142091

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: '2704a392f88573cb26775e6cf394e4039b430a2375becac454e3e57c88aed59d',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b4'
    }],
    [{address: 'znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf', satoshis: 100000}],
    blockHeight,
    blockHash
  )
  var txobj_serialized = zencashjs.transaction.serializeTx(txobj)
  var txobj_deserialized = zencashjs.transaction.deserializeTx(txobj_serialized)

  var txobj_serialized_full = zencashjs.transaction.serializeTx(txobj, true)
  var txobj_deserialized_full = zencashjs.transaction.deserializeTx(txobj_serialized_full, true)
  expect(txobj_deserialized_full).to.deep.equal(txobj)

  // Remove prevScriptPubKey since it's not really an attribute
  for (var i = 0; i < txobj.ins.length; i++) {
    txobj.ins[i].prevScriptPubKey = ''
  }

  expect(txobj_serialized).to.equal('01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')
  expect(txobj_deserialized).to.deep.equal(txobj)
})

it('transaction.mkPubkeyHashReplayScript() valid block with special height 0 (range [0; 16])', function () {
  // Test data was generated on regtest zen node
  const script = zencashjs.transaction.mkPubkeyHashReplayScript(
    'ztfMkdeBW116Q7KRaiGL2qG1kSKGya85NHA',
    0,
    '0da5ee723b7923feb580518541c6f098206330dbc711a6678922c11f2ccf1abb'
  )
  expect(script).to.equal(
    '76a91485dc608e2036a336e26e6da6aa2b807d0ac5206388ac20bb1acf2c1fc1228967a611c7db30632098f0c641855180b5fe23793b72eea50d00b4'
  )
})

it('transaction.mkPubkeyHashReplayScript() valid block with special height 5 (range [0; 16])', function () {
  const script = zencashjs.transaction.mkPubkeyHashReplayScript(
    'ztfMkdeBW116Q7KRaiGL2qG1kSKGya85NHA',
    5,
    '083152db9752b7297b8a634c62484825867f1dc8c912ba2aaa255c7cdac64030'
  )
  expect(script).to.equal(
    '76a91485dc608e2036a336e26e6da6aa2b807d0ac5206388ac203040c6da7c5c25aa2aba12c9c81d7f86254848624c638a7b29b75297db52310855b4'
  )
})

it('transaction.mkPubkeyHashReplayScript() valid block with 1 byte length height', function () {
  const script = zencashjs.transaction.mkPubkeyHashReplayScript(
    'ztfMkdeBW116Q7KRaiGL2qG1kSKGya85NHA',
    33,
    '02a2573d34cffa49730be6628ffa221ace053d7f01cbf5a95d879dd1f4649850'
  )
  expect(script).to.equal(
    '76a91485dc608e2036a336e26e6da6aa2b807d0ac5206388ac20509864f4d19d875da9f5cb017f3d05ce1a22fa8f62e60b7349facf343d57a2020121b4'
  )
})

it('transaction.mkPubkeyHashReplayScript() valid block with 2 bytes length height', function () {
  const script = zencashjs.transaction.mkPubkeyHashReplayScript(
    'ztfMkdeBW116Q7KRaiGL2qG1kSKGya85NHA',
    1005,
    '0884efb1d47ceb0241fd70b5b470474f3ae2a4af9240926924c79b2e3e0c14a0'
  )
  expect(script).to.equal(
    '76a91485dc608e2036a336e26e6da6aa2b807d0ac5206388ac20a0140c3e2e9bc72469924092afa4e23a4f4770b4b570fd4102eb7cd4b1ef840802ed03b4'
  )
})


it('transaction.mkPubkeyHashReplayScript() valid block with 3 bytes length height', function () {
  const script = zencashjs.transaction.mkPubkeyHashReplayScript(
    'ztfMkdeBW116Q7KRaiGL2qG1kSKGya85NHA',
    65678,
    '0ec034235a4e2be08a4c55f658eefeb6ffd1c85dcd778bbe2ff735a1ce200c74'
  )
  expect(script).to.equal(
    '76a91485dc608e2036a336e26e6da6aa2b807d0ac5206388ac20740c20cea135f72fbe8b77cd5dc8d1ffb6feee58f6554c8ae02b4e5a2334c00e038e0001b4'
  )
})

it('signTx() should be deterministic', function () {
  // Create raw transaction at current height
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'
  const blockHeight = 142091

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: '59982119a451a162afc05d6ffe7c332a8c467d006b3bf95e9ff43599b4ed3d38',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20c243be1a6b3d319e40e89b159235a320a1cd50d35c2e52bc79e94b990100000003d92c02b4'
    }],
    [{address: 'znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf', satoshis: 1000000}],
    blockHeight,
    blockHash
  )

  const compressPubKey = true
  const SIGHASH_ALL = 1
  var signedobj = zencashjs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  var signed_serialized = zencashjs.transaction.serializeTx(signedobj)

  expect(signed_serialized).to.equal('0100000001383dedb49935f49f5ef93b6b007d468c2a337cfe6f5dc0af62a151a419219859000000006a473044022035f718d8bafdec55f22d705fee46bd9f2c7cd4261c93a4f24161774b84c77e8b02205e9405e0518f4759b68333472090907f0a29c65bb5cf5e9f2ddf2532ddc506330121038a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2ffffffff0140420f00000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')


  // check that we able to sign object after being serialized/deserialized with prevScriptPubKey
  var txobj_serialized_full = zencashjs.transaction.serializeTx(txobj, true)
  var txobj_deserialized_full = zencashjs.transaction.deserializeTx(txobj_serialized_full, true)

  signedobj = zencashjs.transaction.signTx(txobj_deserialized_full, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  signed_serialized = zencashjs.transaction.serializeTx(signedobj)
  expect(signed_serialized).to.equal('0100000001383dedb49935f49f5ef93b6b007d468c2a337cfe6f5dc0af62a151a419219859000000006a473044022035f718d8bafdec55f22d705fee46bd9f2c7cd4261c93a4f24161774b84c77e8b02205e9405e0518f4759b68333472090907f0a29c65bb5cf5e9f2ddf2532ddc506330121038a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2ffffffff0140420f00000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')


  // check that we are NOT able to sign object being serialized/deserialized WITHOUT prevScriptPubKey
  var txobj_serialized = zencashjs.transaction.serializeTx(txobj)
  var txobj_deserialized = zencashjs.transaction.deserializeTx(txobj_serialized)

  var errorOccurred = false
  try {
    signedobj = zencashjs.transaction.signTx(txobj_serialized, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  }
  catch(err) {
	errorOccurred = true
  }
  expect(errorOccurred).to.equal(true)
})

it('NULL_DATA() should be deterministic', function () {
  // Create raw transaction at current height
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'
  const blockHeight = 142091

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: '59982119a451a162afc05d6ffe7c332a8c467d006b3bf95e9ff43599b4ed3d38',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20c243be1a6b3d319e40e89b159235a320a1cd50d35c2e52bc79e94b990100000003d92c02b4'
    }],
    [{address: null, satoshis: 1000000, data: 'hello world'}],
    blockHeight,
    blockHash
  )

  const compressPubKey = true
  const SIGHASH_ALL = 1
  var signedobj = zencashjs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c', compressPubKey, SIGHASH_ALL)
  var signed_serialized = zencashjs.transaction.serializeTx(signedobj)

  expect(signed_serialized).to.equal('0100000001383dedb49935f49f5ef93b6b007d468c2a337cfe6f5dc0af62a151a419219859000000006b483045022100b5f05e6a1d725b3ca6e6f767067d96a31ce8bcaf5df2230e075c4a28cf074e8f02202bbb2d1e0b52934852a130c6f6dd244e9eecd640bd52c6a367435f68b9decce30121038a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2ffffffff0140420f0000000000336a0b68656c6c6f20776f726c64205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')
})

it('multiSign() for x-of-5 should be deterministic', function () {
  var privKeysWIF = [
    'cT3PtbJfU3VVDR9xp667eqqojDhytDbLGkEjTVZ9fDjXYr73FUE4',
    'cNHYho4iuSjiTwR9J56g5HT9SbkXP5Fs2Pq4qM97FTpjGT4psJ4u',
    'cUgD3WxGu6WFC2yyFv6jubxcHGkid62sp77M5HE2aYgsj6FcFcyW',
    'cTs2Zm57Bd18UPiT5JH1shbSd4XBBvdipCebMtwcnrZDH2sh2px2',
    'cPSDZ6VjeLEsSx6JYetJAajN1p5L5Vod8k5haQH9s2M4nyS48NnW']
  var privKeys = privKeysWIF.map((x) => zencashjs.address.WIFToPrivKey(x))
  var pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))
  // var addresses = pubKeys.map((x) => zencashjs.address.pubKeyToAddr(x, '2098'))
  var redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 5)
  // var multiSigAddress = zencashjs.address.multiSigRSToAddress(redeemScript, '2092')

  const blockHeight = 15600
  const blockHash = '0214c87f3f06ab6a22325da40f3c2066838fd50e75e1e0dc0205935fcbb79ec8'

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: 'd6f04de4f1ab745d8d7d3d6846b718b3bef4baf857af4f26e3847162317982d9',
      vout: 0,
      scriptPubKey: ''
    }],
    [{address: 'ztimpo6bUJk8ngMpRXf3yyhTZBMDLQrDQJD', satoshis: 5000000000}
    ],
    blockHeight,
    blockHash
  )

  // Prepare our signatures for mutli-sig
  var sig1 = zencashjs.transaction.multiSign(txobj, 0, privKeys[0], redeemScript)
  var sig2 = zencashjs.transaction.multiSign(txobj, 0, privKeys[1], redeemScript)
  var tx0 = zencashjs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

  // Serialize the transaction
  var serializedTx = zencashjs.transaction.serializeTx(tx0, true)
  expect(serializedTx).to.equal('0100000001d9827931627184e3264faf57f8baf4beb318b746683d7d8d5d74abf1e44df0d60000000000fd41010047304402206cdd40e6a2906d811d4effb6d70ff25b30a60712255f6b9e974ed71167dffbfb0220481e0e88ec15bfa0d415d6247b14eeb96ac55b2430fb13919ea68b7b7042c92b01483045022100d63748ef626d6336c56a68788906f4a25d83d04c78cf6ea671205aea38a39c9302207b9d679c6fc3970f86dcf912eb82fe69a98843ab69aa63cdd54a0e5023469c86014cad522103e05e33c3322eebb714a070b3a3d8c4d8df24afaa954b73588fb93d225459a8ec21036e8b46ab143d44946080dfe980ff4b17df278e49bae86002c613b23732b20af32103184c5dad8794b6d9b129748e4bb6f7cc56de42bc05e48f2a09521f8018e637e12103b9119362574b8ce5812f72f23e9bca338a90c4f47dfd0dbb3b9e7aa596b422ad2102d52494ff1c42d4e5dd81bc4940368e15137bb62f0963300217291d11682ccc2255aeffffffff0100f2052a010000003e76a914ab523674d9f2ed5a0b300aeb072fc09801363f9f88ac20c89eb7cb5f930502dce0e1750ed58f8366203c0fa45d32226aab063f7fc8140202f03cb400000000')

  var deserializedTx = zencashjs.transaction.deserializeTx(serializedTx, true)
  expect(deserializedTx).to.deep.equal(tx0)
})

it('multiSign() and applyMultiSignatures() and should be deterministic', function () {
  var privKeysWIF = ['KxvE58rxEwckkCjemDVdMDp7wzgosnyX1oyjzWmrcAVpV7EaZdSP', 'L5bpskJWAGGWR1GA9SJkCQ2ndHkezqm8GuoWaBesrrwnsa1roSN6', 'L2sjwCsdZQmckKkTKGDqhKcWtbe3EU2FL4N1YHpD2SC1GhHRhqxF']

  var priv1 = zencashjs.address.WIFToPrivKey(privKeysWIF[0])
  var priv2 = zencashjs.address.WIFToPrivKey(privKeysWIF[1])
  var priv3 = zencashjs.address.WIFToPrivKey(privKeysWIF[2])

  var redeemScript = '522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae'

  // To create and sign a raw transaction at BLOCKHEIGHT and BLOCKHASH
  const blockHeight = 142091
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: 'f5f324064de9caab9353674c59f1c3987ca997bf5882a41a722686883e089581',
      vout: 0,
      scriptPubKey: ''
    }],
    [{address: 'zneng6nRqTrqTKfjYAqXT86HWtk96ftPjtX', satoshis: 10000}],
    blockHeight,
    blockHash
  )

  // Signatures Must be in order
  var sig1 = zencashjs.transaction.multiSign(txobj, 0, priv3, redeemScript)
  var sig2 = zencashjs.transaction.multiSign(txobj, 0, priv2, redeemScript)

  expect(sig1).to.equal('3045022100c65ec438dc13028b1328a0f8426e1970ef202cba168772fe9d91d141e3020413022021b038c2098c29014aa7feef1624c3d9e4035ca960791f3bbe256df9f008038d01')
  expect(sig2).to.equal('3045022100db1f423fe11bf06c9c97692e8086f5743653cad289e3a1c085ae656847ffb9d10220063c103d8c7c54597b055106ab70a45a2254c63435b64375a966c002f85d141901')

  var tx0 = zencashjs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)

  var serializedTx = zencashjs.transaction.serializeTx(tx0)

  expect(serializedTx).to.equal('01000000018195083e888626721aa48258bf97a97c98c3f1594c675393abcae94d0624f3f500000000fdfe0000483045022100c65ec438dc13028b1328a0f8426e1970ef202cba168772fe9d91d141e3020413022021b038c2098c29014aa7feef1624c3d9e4035ca960791f3bbe256df9f008038d01483045022100db1f423fe11bf06c9c97692e8086f5743653cad289e3a1c085ae656847ffb9d10220063c103d8c7c54597b055106ab70a45a2254c63435b64375a966c002f85d1419014c69522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53aeffffffff0110270000000000003f76a914964f1832d9aa7e943d5dd8f84862393b935bbbad88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')

  var deserializedTx = {
    version: 1,
    locktime: 0,
    ins: [ {
      output: { hash: 'f5f324064de9caab9353674c59f1c3987ca997bf5882a41a722686883e089581', vout: 0 },
      script: '00483045022100c65ec438dc13028b1328a0f8426e1970ef202cba168772fe9d91d141e3020413022021b038c2098c29014aa7feef1624c3d9e4035ca960791f3bbe256df9f008038d01483045022100db1f423fe11bf06c9c97692e8086f5743653cad289e3a1c085ae656847ffb9d10220063c103d8c7c54597b055106ab70a45a2254c63435b64375a966c002f85d1419014c69522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae',
      sequence: 'ffffffff',
      prevScriptPubKey: ''
    } ],
    outs: [ { satoshis: 10000, script: '76a914964f1832d9aa7e943d5dd8f84862393b935bbbad88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b4' } ]
  }

  expect(zencashjs.transaction.deserializeTx(serializedTx)).to.deep.equal(deserializedTx)
})

it('addressToScript should be deterministic for both P2SH and P2PKH on mainnet and testnet', function () {
  const addr1 = 'zt27CUh1tqguUvQrcBNpDHtd13adRauiqLX'; // mainnet P2SH
  const addr2 = 'znWXtfAwMMzRFe9Y5u1E8qMhrMWcKodi6KX'; 
  const addr3 = 'ztimpo6bUJk8ngMpRXf3yyhTZBMDLQrDQJD'; // testnet

  const blockHeight = 142091
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'
  expect(zencashjs.transaction.addressToScript(addr1, blockHeight, blockHash, '')).to.equal('a914ed3f0f01c90f41ff665570d38f070c1ee8c075fe87205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b4');
  expect(zencashjs.transaction.addressToScript(addr2, blockHeight, blockHash, '')).to.equal('76a9143bc25502467ba509b9fb3680148a12b89c56247088ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b4');
  expect(zencashjs.transaction.addressToScript(addr3, blockHeight, blockHash, '')).to.equal('76a914ab523674d9f2ed5a0b300aeb072fc09801363f9f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b4');
})
