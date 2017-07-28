var zencashjs = require('..')
var chai = require('chai')
var expect = chai.expect

it('serializeTx() should be deterministic', function () {
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

  expect(txobj_serialized).to.equal('01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')
})

it('signTx() should be deterministic', function () {
  // Create raw transaction at current height
  const blockHash = '00000001cf4e27ce1dd8028408ed0a48edd445ba388170c9468ba0d42fff3052'
  const blockHeight = 142091

  var txobj = zencashjs.transaction.createRawTx(
    [{
      txid: '196173ec34d22a52cc689a21d01dd33b633671cbe1141e7e66240c7f3b4ccf7b',
      vout: 0,
      scriptPubKey: '76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b4'
    }],
    [{address: 'znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf', satoshis: 100000}],
    blockHeight,
    blockHash
  )

  var signedobj = zencashjs.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c')
  var signed_serialized = zencashjs.transaction.serializeTx(signedobj)

  expect(signed_serialized).to.equal('01000000017bcf4c3b7f0c24667e1e14e1cb7136633bd31dd0219a68cc522ad234ec736119000000008b483045022100b69baff0eb5570fd8ddda7b180463035d47eb3b1c07a808a68085fd58e9e22b102202eb3983a2137af4f8c3967b3c6c16c024ad952a712ab92b8911a8797f1864d3d0141048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aadffffffff01a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac205230ff2fd4a08b46c9708138ba45d4ed480aed088402d81dce274ecf01000000030b2b02b400000000')
})