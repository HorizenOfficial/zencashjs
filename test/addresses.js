var zencashjs = require('..')
var chai = require('chai')
var expect = chai.expect

it('MakePrivateKey() should be deterministic', function () {
  var priv = zencashjs.utils.makePrivKey(
    'chris p. bacon, defender of the guardians'
  )
  expect(priv).to.equal(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
})

it('PrivateKeyToWIFFormat() should be deterministic', function () {
  var priv = zencashjs.utils.privKeyToWIF(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
  expect(priv).to.equal('5J9mKPd531Tk4A73kKp4iowoi6EvhEp8QSMAVzrZhuzZkdpYbK8')
})

it('PrivateKeyToPublicKey() should be deterministic', function () {
  var priv = zencashjs.utils.privKeyToPubKey(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
  expect(priv).to.equal(
    '048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad'
  )
})

it('PublicKeyToPublicAddress() should be deterministic', function () {
  var priv = zencashjs.utils.pubKeyToAddr(
    '048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad'
  )
  expect(priv).to.equal('znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf')
})

/*
 * RAW TRANSACTION EXAMPLE: 01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01905f0100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b400000000
 * zen-cli signrawtransaction 01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01905f0100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b400000000 '[{"txid": "2704a392f88573cb26775e6cf394e4039b430a2375becac454e3e57c88aed59d", "vout": 0, scriptPubKey: ""}]' '["5J9mKPd531Tk4A73kKp4iowoi6EvhEp8QSMAVzrZhuzZkdpYbK8"]'
 */
