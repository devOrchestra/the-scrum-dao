var Wallet = require('ethereumjs-wallet');
var ProviderEngine = require("web3-provider-engine");
var WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
var Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
var Web3 = require("web3");
var FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');


let providerUrl;
let walletPass;
if (process.env.NODE_ENV === 'production') {
  providerUrl = process.env.ETH_NODE_URL;
  walletPass = process.env.OWNER_WALLET_SECRET;
} else {
  providerUrl = 'http://localhost:8545';
  walletPass = 'semen';
}
let ownerWalletData = require('./credentials/ownerWallet.json');
let ownerWallet = Wallet.fromV3(ownerWalletData, walletPass);
let address = "0x" + ownerWallet.getAddress().toString("hex");
let engine = new ProviderEngine();
engine.addProvider(new FilterSubprovider());
engine.addProvider(new WalletSubprovider(ownerWallet, {}));
engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(providerUrl)));
engine.start(); // Required by the provider engine.

module.exports = {
  networks: {
    development: {
      provider: engine,
      from: address,
      network_id: "*" // Match any network id
    },
    production: {
      network_id: 3,    // Official ropsten network id
      provider: engine, // Use our custom provider
      from: address     // Use the address we derived
    }
  }
};
