var zencashjs = require('.');
var bs58check = require('bs58check');


var input = process.argv[2];

//var output = bs58check.decode(spendingKey).toString('hex').substring(4);
var output = zencashjs.zaddress.zSecretKeyToTransmissionKey(input);
console.log(output);

//for (let j = 0; j < process.argv.length; j++) {
//    console.log(j + ' -> ' + (process.argv[j]));
//}
