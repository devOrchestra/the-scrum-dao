let Web3 = require('web3');
let Wallet = require('ethereumjs-wallet');
let contract = require('truffle-contract');
let path = require('path');
let ProviderEngine = require("web3-provider-engine");
let WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
let Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
let FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
let Promise = require('bluebird');
let fs = require('fs');
let assert = require("assert");
let loadConfig = require('ini-config');


let projectArtifact = require(path.resolve('./build/contracts/Project.json'));
let planningPokerArtifact = require(path.resolve('./build/contracts/PlanningPoker.json'));
let crowdsaleArtifact = require(path.resolve('./build/contracts/Crowdsale.json'));
let productBacklogArtifact = require(path.resolve('./build/contracts/ProductBacklog.json'));

let deleteFile = Promise.promisify(fs.unlink);
let loadConfigPromise = Promise.promisify(loadConfig);


let gasPrice;
let ownerAddress;
let oracleAddress;
let contracts = {};
let config;

assert(process.env.NODE_ENV, 'NODE_ENV is not defined');

loadConfigPromise(path.resolve('./src/server/config.ini'))
  .then((loadedConfig) => {
    config = loadedConfig;
    let web3;
    switch (config.environment) {

      case 'development':
        web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.url));
        ownerAddress = web3.eth.accounts[0];
        oracleAddress = web3.eth.accounts[0];
        break;

      case 'production':
      case 'stage':
        let ownerWalletData = require(path.resolve(config.ethereum.owner.walletPath));
        let ownerWallet = Wallet.fromV3(ownerWalletData, config.ethereum.owner.walletPassword);
        ownerAddress = `0x${ownerWallet.getAddress().toString("hex")}`;
        let oracleWalletData = require(path.resolve(config.ethereum.oracle.walletPath));
        let oracleWallet = Wallet.fromV3(oracleWalletData, config.ethereum.oracle.walletPassword);
        oracleAddress = `0x${oracleWallet.getAddress().toString("hex")}`;

        let engine = new ProviderEngine();
        engine.addProvider(new FilterSubprovider());
        engine.addProvider(new WalletSubprovider(ownerWallet, {}));
        engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(config.ethereum.url)));
        engine.start();
        web3 = new Web3(engine);
        break;

      default:
        throw Error(`unknown environment: ${config.environment}`);
    }

    console.log(`Owner ${ownerAddress} wallet has been loaded`);
    console.log(`Oracle ${oracleAddress} wallet has been loaded`);
    console.log(`Connection with ethereum node on ${config.ethereum.url} has been established (${config.environment} mode)`);

    let project = contract(projectArtifact);
    project.setProvider(web3.currentProvider);
    let planningPoker = contract(planningPokerArtifact);
    planningPoker.setProvider(web3.currentProvider);
    let crowdsale = contract(crowdsaleArtifact);
    crowdsale.setProvider(web3.currentProvider);
    let productBacklog = contract(productBacklogArtifact);
    productBacklog.setProvider(web3.currentProvider);

    gasPrice = config.ethereum.gasPrice;
    gasPrice = web3.toWei(gasPrice, 'gwei');

    return Promise.all([
        project.deployed(),
        planningPoker.deployed(),
        crowdsale.deployed(),
        productBacklog.deployed()
      ]);
  })
  .then((data) => {
    contracts.project = data[0];
    contracts.planningPoker = data[1];
    contracts.crowdsale = data[2];
    contracts.productBacklog = data[3];

    return Promise.all([
      contracts.project.initPlanningPoker(contracts.planningPoker.address, {from: ownerAddress, gasPrice}),
      contracts.project.initCrowdsale(contracts.crowdsale.address, {from: ownerAddress, gasPrice})
    ]);
  })
  .then(() => {
    console.log(`Project contract has been initialized with PlaningPoker and Crowdsale contracts`);

    let addOracleTasks = [];
    for (let contractName of Object.keys(contracts)) {
      addOracleTasks.push(contracts[contractName].addTrustedOracle(oracleAddress, {from: ownerAddress, gasPrice}));
    }
    return Promise.all(addOracleTasks);
  })
  .then(() => {
    console.log(`Trusted oracle ${oracleAddress} has been added for all contracts`);
    if (config.environment !== 'production') return;
    return deleteFile(path.resolve(config.ethereum.owner.walletPath))
      .then(() => console.log(`Owner wallet V3 file has been removed`));
  })
  .catch((error) => {
    console.log(`Errors occurred during contracts initialization: ${error.message}`);
  });


