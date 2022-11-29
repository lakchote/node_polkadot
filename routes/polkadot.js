const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring } = require("@polkadot/keyring");
const { mnemonicGenerate, mnemonicValidate } = require("@polkadot/util-crypto");
const {
  createKeyringFromMnemonic,
  createAccount,
  getAccountBalance,
  sendTx,
} = require("../services/PolkadotService");

const router = require("express").Router();

router.route("/import_seed").post(async (req, res) => {
  if (!req.body.mnemonic) {
    return res.status(400).json("No mnemonic");
  }
  const mnemonic = req.body.mnemonic;
  const isValidMnemonic = mnemonicValidate(mnemonic);
  if (!isValidMnemonic) {
    return res.status(400).json("Invalid mnemonic");
  } else {
    keyPair = await createKeyringFromMnemonic(mnemonic);
    return res.json(keyPair.address);
  }
});

router.route("/create_account").get(async (req, res) => {
  const mnemonic = mnemonicGenerate();
  keyPair = await createKeyringFromMnemonic(mnemonic);
  res.json({ address: keyPair.address, mnemonic: mnemonic });
});

router.route("/account_balance").get(async (req, res) => {
  accountBalance = await getAccountBalance();
  res.json(accountBalance);
});

router.route("/send").post(async (req, res) => {
  if (!req.body.amount || !req.body.recipient)
    res.status(400).json("Invalid params");
  const result = await sendTx(req.body.recipient, req.body.amount);
  result?.status === "success"
    ? res.json(result?.message)
    : res.status(400).json(result?.message);
});

module.exports = router;
