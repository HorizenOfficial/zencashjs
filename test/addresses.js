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
 * rawsig = '4712e81d796f306156ee99b27b4a6efd64e0c58ef052a73b54039c04ca2f1e624672a818cb62fd751cb51414f7117bec303c6543960b697ad60568f5377f8387'
 * txobj = z.transaction.createRawTx([{txid: '2704a392f88573cb26775e6cf394e4039b430a2375becac454e3e57c88aed59d', vout: 0}], [{address: 'znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf', satoshis: 90000}])
 * tx0 = z.transaction.signTx(txobj, 0, '2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c')
 * RAW TRANSACTION EXAMPLE: 01000000019dd5ae887ce5e354c4cabe75230a439b03e494f36c5e7726cb7385f892a304270000000000ffffffff01905f0100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b400000000
 * SIGNED TRANSACTION EXAMPLE: 0100000001ad077c2ca834f60709bdc72db1e649896c39d2da0643554a9a42ae444864316d0c0000006b483045022100e7ac8c587236f6d30708d868d32c092461b1f364aa4cd30f9d2c380805f8ebad02204422dcafbca1ee881644fb6cb2605bb0dba5fa72a07e0f5db54ca6c18c1c66c50121034f4e442a5a2fda2a298a8f5eb0e7cea1abf8522e2e378e229fce143ff210f7ddffffffff02a0860100000000003f76a914da46f44467949ac9321b16402c32bbeede5e3e5f88ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b4e00f9700000000003f76a91424b1da688dc6d8795af1de0e26adbbfa42a11c9788ac20ebd78933082d25d56a47d471ee5d57793454cf3d2787f77c21f9964b02000000034f2902b400000000
 */
