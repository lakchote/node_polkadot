const { ApiPromise, WsProvider } = require("@polkadot/api");
const { Keyring, KeyringPair } = require("@polkadot/keyring");
const {
  cryptoWaitReady,
  mnemonicGenerate,
  mnemonicValidate,
} = require("@polkadot/util-crypto");
const fs = require("fs");

let api = undefined;

const getKeyPair = async () => {
  const mnemonic = JSON.parse(
    fs.readFileSync("current_mnemonic.json")
  ).mnemonic;
  const keyring = new Keyring();
  const keyPair = keyring.createFromUri(
    mnemonic,
    { name: "sr25519" },
    "sr25519"
  );

  return keyPair;
};

const getAccountBalance = async (address) => {
  if (api === undefined) {
    api = await ApiPromise.create({
      provider: new WsProvider(process.env.WSS_POLKADOT_TESTNET),
    });
  }

  keyPair = await getKeyPair();
  const { data: balance, nonce } = await api.query.system.account(
    keyPair.address
  );

  return balance.free.toHuman();
};

const sendTx = async (recipient, amount) => {
  return new Promise(async (resolve, reject) => {
    if (api === undefined) {
      api = await ApiPromise.create({
        provider: new WsProvider(process.env.WSS_POLKADOT_TESTNET),
      });
    }
  
    await getKeyPair().then(async (keyPair) => {
      await api.tx.balances
        .transfer(recipient, amount)
        .signAndSend(keyPair, ({ events = [], status }) => {
          console.log("Transaction status:", status.type);
  
          if (status.isInBlock) {
            events.forEach(({ event: { data, method, section }, phase }) => {
              if (section + method === "systemExtrinsicFailed") {
                resolve({ status: "error", message: data.toString() });
              }
            });
          } else if (status.isFinalized) {
            console.log("Finalized block hash", status.asFinalized.toHex());
            resolve({ status: "success", message: status.asFinalized.toHex() });
          }
        });
    });
  })

};

const createKeyringFromMnemonic = async (mnemonic) => {
  await cryptoWaitReady();

  const keyring = new Keyring();
  const keyPair = keyring.createFromUri(
    mnemonic,
    { name: "sr25519" },
    "sr25519"
  );

  fs.writeFileSync(
    "current_mnemonic.json",
    JSON.stringify({ mnemonic: mnemonic })
  );

  return keyPair;
};

module.exports = {
  createKeyringFromMnemonic,
  getAccountBalance,
  getKeyPair,
  sendTx,
};
