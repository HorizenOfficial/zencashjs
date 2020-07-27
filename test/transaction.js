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
    'L1iaTQB82ULHmmRh13bE5zNp9ER63Ugpf6sNUvCM6vd7kXWHDQzN',
    'L37p4DF98rML4iSpFHay4r2xFhWtmKG9sj2m5QdfwgrZjD1hfUnv',
    'L5n2oJvEcESxJVyeCFJKyzwFR9aNHEP2uGgPWvwBw6FSrdA4HsFt',
    'Kwd7ngYzkvdgX1d7ZCFm7kxcKoykg8ueYgLMXrBCJ8vCHxuLgUvX',
    'KyTRYVxuTtUJUP9y6woo4xjhrPGjVx9yoCXc8XmvUdUWrCmaKBD1']
  var privKeys = privKeysWIF.map((x) => zencashjs.address.WIFToPrivKey(x))
  var pubKeys = privKeys.map((x) => zencashjs.address.privKeyToPubKey(x, true))
  // var addresses = pubKeys.map((x) => zencashjs.address.pubKeyToAddr(x, '2098'))
  var redeemScript = zencashjs.address.mkMultiSigRedeemScript(pubKeys, 2, 5)
  expect(redeemScript).to.equal('52210238cede278501110b3e320e94efff6f8d5f94fc7e9cf6d5050b934368eb9764862103e915e2063d08f1a01f9b8de03e69ef22ab6379a2aa3ff4b90251b1779449b1c82103fdf2a1c195580fefb44a03a40b8eadee916ee693f65209b7d240b7c76b05e9452103da55c11a981373e0a77558e8e06c8ab243144beef7e3ba27d6d341dbc747b15221026f350745d3f24339d646c1932eabc5f553b09d3558e367c59db8835de9cb9f9c55ae')

  // var multiSigAddress = zencashjs.address.multiSigRSToAddress(redeemScript, '2092')

  const blockHeight = 0
  const blockHash = '0007104ccda289427919efc39dc9e4d499804b7bebc22df55f8b834301260602'

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: '4a25e1938fcb3dc12b6e0bad4cd38bb206eccc12cdab6698799e4d71f218fd13',
      vout: 0,
      scriptPubKey: ''
    }],
    [{address: 'zng59HwdjkiYhzgFQ52Z3ZrmWiyB8kj687j', satoshis: 99329}
    ],
    blockHeight,
    blockHash
  )

  // Prepare our signatures for mutli-sig
  var sig1 = zencashjs.transaction.multiSign(txobj, 0, privKeys[2], redeemScript)
  var sig2 = zencashjs.transaction.multiSign(txobj, 0, privKeys[3], redeemScript)

  expect(sig1).to.equal('3045022100d11cf82c7a8171a58f24291b82147cc1bb7f01b4ce2c903db504e72e787091c502203475b9fd239e09cfefc81505a9be6feb20b6e3f90a780ac2b0fd35d7a51ac50601')
  expect(sig2).to.equal('30440220330f82b8621d81b70c5e9e4af30259941ff477e330c7ed7d9802523a6c2747390220042dc8b0c01d543937b8eb80b9a94fc048c3f43f707f2f401941e4de48753d1701')

  var tx0 = zencashjs.transaction.applyMultiSignatures(txobj, 0, [sig1, sig2], redeemScript)
  // Serialize the transaction
  var serializedTx = zencashjs.transaction.serializeTx(tx0)
  expect(serializedTx).to.equal('010000000113fd18f2714d9e799866abcd12ccec06b28bd34cad0b6e2bc13dcb8f93e1254a00000000fd410100483045022100d11cf82c7a8171a58f24291b82147cc1bb7f01b4ce2c903db504e72e787091c502203475b9fd239e09cfefc81505a9be6feb20b6e3f90a780ac2b0fd35d7a51ac506014730440220330f82b8621d81b70c5e9e4af30259941ff477e330c7ed7d9802523a6c2747390220042dc8b0c01d543937b8eb80b9a94fc048c3f43f707f2f401941e4de48753d17014cad52210238cede278501110b3e320e94efff6f8d5f94fc7e9cf6d5050b934368eb9764862103e915e2063d08f1a01f9b8de03e69ef22ab6379a2aa3ff4b90251b1779449b1c82103fdf2a1c195580fefb44a03a40b8eadee916ee693f65209b7d240b7c76b05e9452103da55c11a981373e0a77558e8e06c8ab243144beef7e3ba27d6d341dbc747b15221026f350745d3f24339d646c1932eabc5f553b09d3558e367c59db8835de9cb9f9c55aeffffffff0101840100000000003c76a914a4649323b65125c6da8b1788fc16a95be3ff42e588ac200206260143838b5ff52dc2eb7b4b8099d4e4c99dc3ef19794289a2cd4c10070000b400000000')

  var deserializedTx = zencashjs.transaction.deserializeTx(serializedTx)
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

it('serializeTx() and desrializeTx() should be deterministic with sidechain params', function () {

  // Sidechain creation
  var txobj = zencashjs.transaction.createRawTx(
      [
        {
          txid: 'b34df6bc33e62bd39eff69cd31defd22811adbb2607233c387a5617b5b498aab',
          vout: 0,
          scriptPubKey: '76a9147c62ed3d703482861470d09c7ea4249b977e191d88ac202ec42f9e5bc9b364298db033d39ec1f8d9f240c695bb84a0eaf9cb8fdda8210003c05b0ab4'
        }],
      [{ address: 'zteVf4PasYYqzR5H8Pszf7zbLK3kgitggva', satoshis: 47890000 }],
      680508 ,
      '002b378921fcee8f17a95bee7a2878c63ecdf1eb5258c4fe9b5141e6ad8772a1',
      [{ epoch_length: 200,
        address: 'aa1',
        amount: '112000000',
        wCertVk: '1f630fab908780192a8df0005ddd16a14d6ca0343fedf716bdcba1f2243d963fe18bd5a5b464f6d8f4e82725697fd355b1e34bbf7b08d835e5b22d8de21336c084f6f491052d342de5d6b6b9da73ed2e35e919005138ce984d30e1def501000096d6dfa049db0f349cf5e42ba24a51104ba625045dbaa5bdf06e572d8b7953ddad960b3def3484e04f05dd36553517ef7df948698b6824fa81371f58dafb09b9639abba5f6ddf2d64415ba347fbbbdb4c300e5c0dc405de2fd569661619a0100ec1943d4a687defb244294eb837b409228e1a366a789bc961f623eacaf81b466c3dd08a6eaab1705ed2059d5c2d44ed273accc1aa4ffcbc627d601682333f413d192b9c4f6ed0f37ceca5168b7a3e143965fe5ecfc1f32fc118fd9fb98be000046dadc06a2587a45d9ca2b4bbbdd5d42d5eb2d944e5a6d2c48dc420c1285a4585c1ddfcee171f2e614a885ee8d46fb23cb0efc775d8f1cedc8a11f591c71a33654800716fc796f297638b03b209a71335bf7440fab38f5963e11a290ec2c0000f8cba05382364c2fc465b1550b6e6f34dc937081c39e434fc5bf36a46710dda3341f19697a6551321bef0c0672c301c17c81fa88eb44c5798f264f2aa9fb39a2f1564cae2829268666fd542d7a9b34695720aa6a0898595030e48f2239290000f4233defe26c2f94bd6230020bc9abeeca0cdcbe704f3251ad3d355d1f151acde4c8dd8d27d993593de410ffd80684384ef2cbfb90b9a459fa7e30a6edfbf3b356bd817578a1f616b2e2237ce4d8b3f0082323dd358626dd6732bf925feb00003ec6b3c6d078b58b544e1c130563e5e2f75dc6c9f6661304d914a806b3ac032e3a47f069ebe233dcdf71d878d2e8337ddd3fb693d6a33d7b772e733c374ccc2b25d8b0442387473a47713dc95d1902289bb38678e43b91d08d2df7ccff7d00007715e6714e3ea8dd9ad640f322ff4d2c2d32f408f9f6ac204b6c71620b4152b2c9a03da047fce160f63323318ae09b566a51e8ed3ae0e67e04dbc0b77e9ce4d524e327875f68fa845f38e54f75a645661a2415103e41b3b4645c8a3dca5e000000bea1568c431c5751ba390efc2568f1b85dca476f081af1a61b72c232ce97c61a3dc6fbe79f8effd63abeb99e3f16067cb6fcdf8c2635642c677d33f8b76d6d8d005d2f89d74f18efe4bcd9718e5989be06262050a1b931706447494ce89001001eade4729c22b33f9894ed31d5d321789036c9b49a57192af2e18d418ee20c776dbfaa1d0b4d509445d1ed648286b9d4929e099cfc1d31c6b963ae17b0298c029b1e92b603e891fd132dcb088739a8ce799dedc36753a7cc4610f13fc211010045e0a200a8e5d27c012e767d7e3bc50967dd8a19123cd9a4eb92e17b4e00768fed2dd4ed67300b4fe5ac074a0d2d7a7490c40fbfea6ec4a0ddc4a0b7657239c6adafab8fe5f3a34c0dc2154444ec04270949a2e3fd6c5d028407710239ac0000643ea9f318105677f7afd709643ac2b0decd5b77568998eeb3c3646795baac533ba9d827b3c78b4336c38ad5c473e44211bb0db71477fc0d8e4e29393ea071843cfd0c8464950da697ddeb7f50637c566376bd332831ca1599a5c06f172f0100000000000279f13e46f4b2aefca632b88b1989afad65c3f80d770676c133eeb1d82ab0b286e618ac401f454563364cba5460e43f097e3a7549b87653f812935f0fda94b36baccd0f58d289f629ba2eacd80c2854213f7bcf65c6c7c6bf6bd1bca85cb90100c9af1184c2712ea2810beb0f5719a172334b8230e784f14adba8ee5d34f597c216c4dc5e2512aedd49d11a52fffdb2f68a481f27557a57c9a566124dbb909770f6fbae5dd67eff74fcfbb3d7181686792ca6a9e1e81f55a685f5e5c697c1000000d11e38efb88324008f7538140bb2c1cc9a2e6beff914c71791821c1f6815066cd1842ae13e97b8f5ff8b785e84578a9e4899ac43dec4a5b63bc20cee0263a27de49d8ced2ca0cf47dbee04c4c522974e28032c594e105e63d8339210482f0100f3eee01bf93a05228b5f4db31f739fd747d68ebc1ddd5a7bf8b63c42f0ea33ed62b98bfe53504134b5ba6218f1410551ee6e926c2c28a2e1ba83255112fe56313c685572fcf1f7d931ae9d4f03cfaaf2e6864442b9f336e29874a6f8f66d010000',
        constant: '6f43dffefc82b4c3983bab88f235e99ccb264099f5c269e12f3dfaa638c94c222693fbeabde8011db2d24bfecf50c3f7052bb19507737ede7bc6da0d140f12ef89048a8344cf10c83f45fdbb7f17705924827eef720f75cd2a023e7166be0000',
        customData: 'aaaa' }],
      []
  )

  var signedobj = zencashjs.transaction.signTx(txobj, 0, 'f9a92c452dfdc34bc1fe847f6bc70499d138debfe591a5e6c0add6ef799aa029', true)
  var txobj_serialized = zencashjs.transaction.serializeTx(signedobj)
  expect(txobj_serialized).to.equal("fcffffff01ab8a495b7b61a587c3337260b2db1a8122fdde31cd69ff9ed32be633bcf64db3000000006a4730440220114635818ba7205a4815154cbbe60655894c3b219fada4229cd71683323c068d02207e8f1edca4a918b6e0cf6b0158027db1785991dfdcb084c978aa95c5af954ad70121026d65ab3857d567220473d3d3aaf6fa8038d3d6609310073b956c5c89ae4b20d3ffffffff0150beda02000000003f76a9147c62ed3d703482861470d09c7ea4249b977e191d88ac20a17287ade641519bfec45852ebf1cd3ec678287aee5ba9178feefc2189372b00033c620ab401c800000000fcac060000000000000000000000000000000000000000000000000000000000000000000010aa02aaaa606f43dffefc82b4c3983bab88f235e99ccb264099f5c269e12f3dfaa638c94c222693fbeabde8011db2d24bfecf50c3f7052bb19507737ede7bc6da0d140f12ef89048a8344cf10c83f45fdbb7f17705924827eef720f75cd2a023e7166be00001f630fab908780192a8df0005ddd16a14d6ca0343fedf716bdcba1f2243d963fe18bd5a5b464f6d8f4e82725697fd355b1e34bbf7b08d835e5b22d8de21336c084f6f491052d342de5d6b6b9da73ed2e35e919005138ce984d30e1def501000096d6dfa049db0f349cf5e42ba24a51104ba625045dbaa5bdf06e572d8b7953ddad960b3def3484e04f05dd36553517ef7df948698b6824fa81371f58dafb09b9639abba5f6ddf2d64415ba347fbbbdb4c300e5c0dc405de2fd569661619a0100ec1943d4a687defb244294eb837b409228e1a366a789bc961f623eacaf81b466c3dd08a6eaab1705ed2059d5c2d44ed273accc1aa4ffcbc627d601682333f413d192b9c4f6ed0f37ceca5168b7a3e143965fe5ecfc1f32fc118fd9fb98be000046dadc06a2587a45d9ca2b4bbbdd5d42d5eb2d944e5a6d2c48dc420c1285a4585c1ddfcee171f2e614a885ee8d46fb23cb0efc775d8f1cedc8a11f591c71a33654800716fc796f297638b03b209a71335bf7440fab38f5963e11a290ec2c0000f8cba05382364c2fc465b1550b6e6f34dc937081c39e434fc5bf36a46710dda3341f19697a6551321bef0c0672c301c17c81fa88eb44c5798f264f2aa9fb39a2f1564cae2829268666fd542d7a9b34695720aa6a0898595030e48f2239290000f4233defe26c2f94bd6230020bc9abeeca0cdcbe704f3251ad3d355d1f151acde4c8dd8d27d993593de410ffd80684384ef2cbfb90b9a459fa7e30a6edfbf3b356bd817578a1f616b2e2237ce4d8b3f0082323dd358626dd6732bf925feb00003ec6b3c6d078b58b544e1c130563e5e2f75dc6c9f6661304d914a806b3ac032e3a47f069ebe233dcdf71d878d2e8337ddd3fb693d6a33d7b772e733c374ccc2b25d8b0442387473a47713dc95d1902289bb38678e43b91d08d2df7ccff7d00007715e6714e3ea8dd9ad640f322ff4d2c2d32f408f9f6ac204b6c71620b4152b2c9a03da047fce160f63323318ae09b566a51e8ed3ae0e67e04dbc0b77e9ce4d524e327875f68fa845f38e54f75a645661a2415103e41b3b4645c8a3dca5e000000bea1568c431c5751ba390efc2568f1b85dca476f081af1a61b72c232ce97c61a3dc6fbe79f8effd63abeb99e3f16067cb6fcdf8c2635642c677d33f8b76d6d8d005d2f89d74f18efe4bcd9718e5989be06262050a1b931706447494ce89001001eade4729c22b33f9894ed31d5d321789036c9b49a57192af2e18d418ee20c776dbfaa1d0b4d509445d1ed648286b9d4929e099cfc1d31c6b963ae17b0298c029b1e92b603e891fd132dcb088739a8ce799dedc36753a7cc4610f13fc211010045e0a200a8e5d27c012e767d7e3bc50967dd8a19123cd9a4eb92e17b4e00768fed2dd4ed67300b4fe5ac074a0d2d7a7490c40fbfea6ec4a0ddc4a0b7657239c6adafab8fe5f3a34c0dc2154444ec04270949a2e3fd6c5d028407710239ac0000643ea9f318105677f7afd709643ac2b0decd5b77568998eeb3c3646795baac533ba9d827b3c78b4336c38ad5c473e44211bb0db71477fc0d8e4e29393ea071843cfd0c8464950da697ddeb7f50637c566376bd332831ca1599a5c06f172f0100000000000279f13e46f4b2aefca632b88b1989afad65c3f80d770676c133eeb1d82ab0b286e618ac401f454563364cba5460e43f097e3a7549b87653f812935f0fda94b36baccd0f58d289f629ba2eacd80c2854213f7bcf65c6c7c6bf6bd1bca85cb90100c9af1184c2712ea2810beb0f5719a172334b8230e784f14adba8ee5d34f597c216c4dc5e2512aedd49d11a52fffdb2f68a481f27557a57c9a566124dbb909770f6fbae5dd67eff74fcfbb3d7181686792ca6a9e1e81f55a685f5e5c697c1000000d11e38efb88324008f7538140bb2c1cc9a2e6beff914c71791821c1f6815066cd1842ae13e97b8f5ff8b785e84578a9e4899ac43dec4a5b63bc20cee0263a27de49d8ced2ca0cf47dbee04c4c522974e28032c594e105e63d8339210482f0100f3eee01bf93a05228b5f4db31f739fd747d68ebc1ddd5a7bf8b63c42f0ea33ed62b98bfe53504134b5ba6218f1410551ee6e926c2c28a2e1ba83255112fe56313c685572fcf1f7d931ae9d4f03cfaaf2e6864442b9f336e29874a6f8f66d0100000000000000")


  // Forward transfer
  txobj = zencashjs.transaction.createRawTx(
      [
        {
          txid: '8bdd8276b3e207474825d0a1c79ef46bdc6982208b2517ef9f740418a593a808',
          vout: 1,
          scriptPubKey: '76a9146305fb5f1b6b3745cfecb51ab8d5e4a2492ff02f88ac20e01e6f5b181a0edd9412181419ef45ee0bb9febeaac5f51be501dd3c26ac2e0003f7540ab4'
        },
        {
          txid: '2cc48dcf8a01eef2a1df9fff337e77b69c80de31117bf28dcc7591ab1c1b2617',
          vout: 0,
          scriptPubKey: '76a9146305fb5f1b6b3745cfecb51ab8d5e4a2492ff02f88ac20b69be7df4ffd2157a034f5075fea1f28d7249fe3fbbe6a072f02f64aacb90c0003f3540ab4'
        }],
      [{ address: 'ztcBYpgCM1ZiscBrxxef9h22A9qQo9LiD7k', satoshis: 89970000 }],
      680522 ,
      '001029cee2bf87b1c4680d235b8170dd43fc1dae63cbaef310dd0d2725e5d511',
      [],
      [{
        address: 'ababab12',
        amount: 100000000,
        scid: 'a835766dc2745bfd87d1673113cb3e8a0e418a1220ff8b92aefb0bde68081610'
      },
    ]
  )
  var signedobj1 = zencashjs.transaction.signTx(txobj, 0, '596d49f5c38d2b8e8d2b7f67c4754e1d6c5a107f8f97e361abff1b7811eb7dd6', true)
  signedobj = zencashjs.transaction.signTx(signedobj1, 1, '596d49f5c38d2b8e8d2b7f67c4754e1d6c5a107f8f97e361abff1b7811eb7dd6', true)
  txobj_serialized = zencashjs.transaction.serializeTx(signedobj)
  expect(txobj_serialized).to.equal("fcffffff0208a893a51804749fef17258b208269dc6bf49ec7a1d025484707e2b37682dd8b010000006a4730440220452aea7cda123a302bb3dc6b61fe92c8a6b7b7a3e54bd287fed4e43490012fff022038a21a4e5f61eed7f259b746f5a4dfad002e5a54cb84673226a2747de03848a40121036e7e7bfc27e91e169c11df74266b685b3d15696431efc4e76d68d22e411e9f6cffffffff17261b1cab9175cc8df27b1131de809cb6777e33ff9fdfa1f2ee018acf8dc42c000000006b483045022100cd136669bb7194b9a72274f4753b2d7dc0ae86afd96af247cc3b4809a3707e0402203e62e76e7175b155909244229898821f6ea4d7e5f3ef1eeb0df2b44894d841f90121036e7e7bfc27e91e169c11df74266b685b3d15696431efc4e76d68d22e411e9f6cffffffff0150d55c05000000003f76a9146305fb5f1b6b3745cfecb51ab8d5e4a2492ff02f88ac2011d5e525270ddd10f3aecb63ae1dfc43dd70815b230d68c4b187bfe2ce291000034a620ab4000100e1f505000000000000000000000000000000000000000000000000000000000000000012ababab10160868de0bfbae928bff20128a410e8a3ecb133167d187fd5b74c26d7635a800000000")
})