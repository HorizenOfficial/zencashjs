var zencashjs = require("..");
var chai = require("chai");
var expect = chai.expect;

const ZENADDRESS = "ztWAkLGMCURSFb4sGhqXFQwUYHhEWNjVApJ";
const ZENADDRESS_PRIVATEKEY =
  "a629a8e06ed48f85fcc19137257929fa6882eac7d8b8aed349d0d106d5069378";
const MESSAGE = "ciao";
const EXPECTED_SIGN =
  "HyfEVMrykkS0ogn55bXscQs9WrJtxZMPL+ZetbBSSbcXScyUDMybHtjXpT6Lmz4OuxYWvXtia9etbH5wAw133A8=";

it("Message can be signed correctly", function () {
  const sign = zencashjs.message.sign(MESSAGE, ZENADDRESS_PRIVATEKEY, true);
  expect(sign.toString("base64")).to.equal(EXPECTED_SIGN);
});

it("Signature can be verified", function () {
  const result = zencashjs.message.verify(MESSAGE, ZENADDRESS, EXPECTED_SIGN);
  expect(result).to.equal(true);
});

it("sign() and verify() a message", function () {
  const privKey = zencashjs.address.WIFToPrivKey(
    "KzhNDpxgLhbCmvff9qBeh6NRMAY1qqqQ3bKFv5XeSh1rESKt6GHP"
  );
  const message = "This is an example of a signed message.";
  const signature = zencashjs.message
    .sign(message, privKey, true)
    .toString("base64");
  const addr = "znbL55xtBg8nRR5KnywRBdUuNWjLTB4mP7b";

  const verify = zencashjs.message.verify(message, addr, signature);
  expect(verify).to.equal(true);
});

it("verify() an invalid message", function () {
  const privKey = zencashjs.address.WIFToPrivKey(
    "KzhNDpxgLhbCmvff9qBeh6NRMAY1qqqQ3bKFv5XeSh1rESKt6GHP"
  );
  const message = "This is an example of a signed message.";
  const message2 = message + "abcd";
  const signature = zencashjs.message
    .sign(message, privKey, true)
    .toString("base64");
  const addr = "znbL55xtBg8nRR5KnywRBdUuNWjLTB4mP7b";

  const verify = zencashjs.message.verify(message2, addr, signature);
  expect(verify).to.equal(false);
});

it("verify() an invalid signature", function () {
  const message = "This is an example of a signed message.";
  const incorrectSig =
    "IOxOcEOoGMEiOJ+5MXBqpi+HkzPoFqufWNZTW3iD78QpF3G5/wxr1YbunxRmhIVSr4zd0fug4+I72T+bYKVIV+E=s";
  const addr = "znbL55xtBg8nRR5KnywRBdUuNWjLTB4mP7b";

  const verify = zencashjs.message.verify(message, addr, incorrectSig);
  expect(verify).to.equal(false);
});
