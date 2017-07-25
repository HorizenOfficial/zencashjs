# zencashjs
Dead simple and easy to use JavaScript based ZenCASH library. Inspired by [pybitcointools](https://github.com/vbuterin/pybitcointools)

# Getting started (Dev)
```bash
git clone https://github.com/kendricktan/zencashjs.git
cd zencashjs
yarn install
yarn build

# Dev flow
flow status
yarn build
yarn test
```

# Example usage
```javascript
var zencash = require('zencashjs')

var priv = zencashjs.utils.makePrivKey('chris p. bacon, defender of the guardians')
// 2c3a48576fe6e8a466e78cd2957c9dc62128135540bbea0685d7c4a23ea35a6c

var privWIF = zencashjs.utils.privKeyToWIF(priv)
// 5J9mKPd531Tk4A73kKp4iowoi6EvhEp8QSMAVzrZhuzZkdpYbK8

var pubKey = zencashjs.utils.privKeyToPubKey(priv)
// 048a789e0910b6aa314f63d2cc666bd44fa4b71d7397cb5466902dc594c1a0a0d2e4d234528ff87b83f971ab2b12cd2939ff33c7846716827a5b0e8233049d8aad

var zAddr = zencashjs.utils.pubKeyToAddr(pubKey)
// znkz4JE6Y4m8xWoo4ryTnpxwBT5F7vFDgNf
```