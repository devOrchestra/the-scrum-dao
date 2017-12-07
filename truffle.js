let Wallet = require('ethereumjs-wallet');
let ProviderEngine = require("web3-provider-engine");
let WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
let Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
let Web3 = require("web3");
let FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
let assert = require('assert');

let toWei = new Web3().toWei;

assert(process.env.NODE_ENV, 'NODE_ENV is not defined');

const GAS_LIMIT = 3100000; // max deployment gas from gas-price.json
let address;
let providerUrl;
let engine;
let gasPrice = process.env.ETH_GAS_PRICE || 20;
gasPrice = toWei(gasPrice, 'gwei');

if (process.env.NODE_ENV === 'development') {
  providerUrl = 'http://localhost:8545';
  let web3 = new Web3(new Web3.providers.HttpProvider(providerUrl));
  address = web3.eth.accounts[0];
  engine = web3.currentProvider;

} else if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'stage') {

  let walletPassword;
  if (process.env.NODE_ENV === 'production') {
    walletPassword = process.env.OWNER_WALLET_PASSWORD;
    providerUrl = process.env.ETH_NODE_URL;
  } else {
    walletPassword = 'semen';
    providerUrl = 'https://ropsten.infura.io/QTeUiM06pSmTwLqjbcip';
  }

  let ownerWalletData = require('./credentials/ownerWallet.json');
  let ownerWallet = Wallet.fromV3(ownerWalletData, walletPassword);
  address = "0x" + ownerWallet.getAddress().toString("hex");
  engine = new ProviderEngine();
  engine.addProvider(new FilterSubprovider());
  engine.addProvider(new WalletSubprovider(ownerWallet, {}));
  engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
  engine.start(); // Required by the provider engine.
}

module.exports = {
  networks: {
    development: {
      gas: GAS_LIMIT,
      gasPrice,
      provider: engine,
      from: address,
      network_id: "*" // Match any network id
    },
    production: {
      gas: GAS_LIMIT,
      gasPrice,
      network_id: 1,
      provider: engine,
      from: address
    },
    stage: {
      gas: GAS_LIMIT,
      gasPrice,
      network_id: 3,
      provider: engine,
      from: address
    },
    stub: {}
  }
};
