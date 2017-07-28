var zencashjs = require('..')
var chai = require('chai')
var expect = chai.expect

it('MakePrivateKey() should be deterministic', function () {
  var priv = zencashjs.address.makePrivKey(
    'chris p. bacon, defender of the guardians'
  )
  expect(priv).to.equal(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
})

it('PrivateKeyToWIFFormat() should be deterministic', function () {
  var priv = zencashjs.address.privKeyToWIF(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
  expect(priv).to.equal('5J9mKPd531Tk4A73kKp4iowoi6EvhEp8QSMAVzrZhuzZkdpYbK8')
})

it('PrivateKeyToPublicKey() should be deterministic', function () {
  var priv = zencashjs.address.privKeyToPubKey(
    '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c'
  )
  expect(priv).to.equal(
    '048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad'
  )
})

it('PublicKeyToPublicAddress() should be deterministic', function () {
  var priv = zencashjs.address.pubKeyToAddr(
    '048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad'
  )
  expect(priv).to.equal('znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf')
})
