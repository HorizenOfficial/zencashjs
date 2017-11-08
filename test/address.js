var zencashjs = require('..')
var chai = require('chai')
var expect = chai.expect

it('MkPrivateKey() should be deterministic', function () {
  var priv = zencashjs.address.mkPrivKey(
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

it('mkMultiSigRedeemScript() should be deterministic', function () {
  var redeemScript = zencashjs.address.mkMultiSigRedeemScript(
    ['03519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd487', '02d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a616544', '02696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e'],
    2, 3
  )
  expect(redeemScript).to.equal('522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae')
})

it('multiSigRSToAddress() should be deterministic', function () {
  var msAddress = zencashjs.address.multiSigRSToAddress('522103519842d08ea56a635bfa8dd617b8e33f0426530d8e201107dd9a6af9493bd4872102d3ac8c0cb7b99a26cd66269a312afe4e0a621579dfe8b33e29c597a32a6165442102696187262f522cf1fa2c30c5cd6853c4a6c51ad5ba418abb4e3898dbc5a93d2e53ae')  

  expect(msAddress).to.equal('zsmSCni8GXoCdTGqUfn26QJVGh6rpaFs17T')
})
