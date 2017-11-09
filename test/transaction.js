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

  // Remove prevScriptPubKey since its not really an attribute
  for (var i = 0; i < txobj.ins.length; i++) {
    txobj.ins[i].prevScriptPubKey = ''
  }

  expect(txobj_serialized).to.equal('01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')
  expect(txobj_deserialized).to.deep.equal(txobj)
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
