var bs58 = require('bs58check')
var sjcl = require('sjcl')
var zencashjs = require('zencashjs')

var priv = zencashjs.utils.sha256('chris p. bacon, guardian of the pigs')
var privWIF = zencashjs.utils.privKeyToWIF(priv)
var pubKey = zencashjs.utils.privKeyToPubKey(priv)
var zAddr = zencashjs.utils.pubKeyToAddr(pubKey)

console.log('Private key: ' + priv)
console.log('Private key WIF: ' + privWIF)
console.log('Public key: ' + pubKey)
console.log('Zen Addr: ' + zAddr)