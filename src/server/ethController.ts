import Web3 = require('web3');
import Wallet = require('ethereumjs-wallet');
import contract = require('truffle-contract');
import path = require('path');
import ProviderEngine = require("web3-provider-engine");
import WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
import Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
import FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
import Promise = require('bluebird');

import logger from './logger';

class EthController {

  constructor(projectName, config) {
    this.projectName = projectName;
    this.config = config;
    this.contracts = {};
  }

  // FIELDS
  public projectName: string;
  private config: any;
  private web3: Web3;
  private contracts: any;
  private ethAddress: string;

  // METHODS
  public init(done): void {

    let artifacts: any = {};
    try {
      artifacts.project = require(path.resolve('./build/contracts/Project.json'));
      artifacts.planningPoker = require(path.resolve('./build/contracts/PlanningPoker.json'));
      artifacts.crowdsale = require(path.resolve('./build/contracts/Crowdsale.json'));
      artifacts.productBacklog = require(path.resolve('./build/contracts/ProductBacklog.json'));
    } catch (error) {
      return process.nextTick(()=>{done(error)});
    }

    this.initWithOracleWallet(artifacts)
      .then(() => done())
      .catch((error) => done(error));

  }

  private initWithOracleWallet(artifacts): Promise {
    let oracleWallet: LoadedWallet;
    return Promise
      .resolve()
      .then(() => {
        oracleWallet = this.loadWallet('oracle');
        this.setWeb3Engine(oracleWallet);
        return this.initContractInstances(artifacts);
      });
  }

  private loadWallet(entity: string): LoadedWallet {
    let wallet: any = {entity};
    switch (this.config.environment) {

      case 'development':
        let web3 = new Web3(new Web3.providers.HttpProvider(this.config.ethereum.url));
        if (entity === 'owner') {
          wallet.address = web3.eth.accounts[0];
        } else {
          wallet.address = web3.eth.accounts[0];
        }
        break;

      case 'production':
      case 'stage':
        let walletData = require(path.resolve(this.config.ethereum[entity].walletPath));
        wallet.v3Wallet = Wallet.fromV3(walletData, this.config.ethereum[entity].walletPassword);
        wallet.address = `0x${wallet.v3Wallet.getAddress().toString("hex")}`;
        break;

      default:
        throw Error(`unknown environment: ${this.config.environment}`);
    }
    logger.info(`Wallet of ${entity} with address ${wallet.address} has been loaded`);
    return wallet;
  }

  private setWeb3Engine(wallet: LoadedWallet): void {
    switch (this.config.environment) {

      case 'development':
        this.ethAddress = wallet.address;
        this.web3 = new Web3(new Web3.providers.HttpProvider(this.config.ethereum.url));
        break;

      case 'production':
      case 'stage':
        this.ethAddress = wallet.address;
        let engine = new ProviderEngine();
        engine.addProvider(new FilterSubprovider());
        engine.addProvider(new WalletSubprovider(wallet.v3Wallet, {}));
        engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(this.config.ethereum.url)));
        engine.start();
        this.web3 = new Web3(engine);
        break;

      default:
        throw Error(`unknown environment: ${this.config.environment}`);
    }
    logger.info(`Ethereum Controller has been connected to ${this.config.ethereum.url} node as ${wallet.entity} with address ${this.ethAddress}`);
  }

  private initContractInstances(artifacts: any): Promise {
    let project = contract(artifacts.project);
    project.setProvider(this.web3.currentProvider);
    let planningPoker = contract(artifacts.planningPoker);
    planningPoker.setProvider(this.web3.currentProvider);
    let crowdsale = contract(artifacts.crowdsale);
    crowdsale.setProvider(this.web3.currentProvider);
    let productBacklog = contract(artifacts.productBacklog);
    productBacklog.setProvider(this.web3.currentProvider);

    return Promise
      .all([
        project.deployed(),
        planningPoker.deployed(),
        crowdsale.deployed(),
        productBacklog.deployed()
      ])
      .then((contracts) => {
        this.contracts.project = contracts[0];
        this.contracts.planningPoker = contracts[1];
        this.contracts.crowdsale = contracts[2];
        this.contracts.productBacklog = contracts[3];
      });
  }

  public createStoryPointsVoting(issueName: string, options: ContractMethodOptions, done): void {
    options.from = this.ethAddress;
    this.contracts.planningPoker
      .addVoting(issueName, options)
      .then(() => {
        logger.info(`Project ${this.projectName} issue ${issueName}. Story points voting  has been added`);
        done(null);
      })
      .catch((error: Error) => {
        logger.error(`Project ${this.projectName} issue ${issueName}. Errors occurred during creating story points voting: ${error.message}`);
        done(error);
      });
  }

  public closeStoryPointsVoting(issueName: string, options: ContractMethodOptions, done): void {
    options.from = this.ethAddress;
    this.contracts.planningPoker
      .closeVoting(issueName, options)
      .then(() => {
        logger.info(`Project ${this.projectName} issue ${issueName}. Story points voting has been closed`);
        done(null);
      })
      .catch((error: Error) => {
        logger.error(`Project ${this.projectName} issue ${issueName}. Errors occurred during closing story points voting: ${error.message}`);
        done(error);
      });
  }

  public payIssueAward(username: string, issueName: string, options: ContractMethodOptions, done): void {
    options.from = this.ethAddress;
    this.contracts.project
      .payAward(username, issueName, options)
      .then(() => {
        logger.info(`Project ${this.projectName} issue ${issueName}. Award has been payed`);
        done(null);
      })
      .catch((error: Error) => {
        logger.error(`Project ${this.projectName} issue ${issueName}. Errors occurred during paying the award: ${error.message}`);
        done(error);
      });
  }

  public createPriorityVoting(issueName: string, options: ContractMethodOptions, done): void {
    options.from = this.ethAddress;
    this.contracts.productBacklog
      .addVoting(issueName, options)
      .then(() => {
        logger.info(`Project ${this.projectName} issue ${issueName}. Priority voting has been added`);
        done(null);
      })
      .catch((error: Error) => {
        logger.error(`Project ${this.projectName} issue ${issueName}. Errors occurred during creating priority voting: ${error.message}`);
        done(error);
      });
  }

  public closePriorityVoting(issueName: string, options: ContractMethodOptions, done): void {
    options.from = this.ethAddress;
    this.contracts.productBacklog
      .closeVoting(issueName, options)
      .then(() => {
        logger.info(`Project ${this.projectName} issue ${issueName}. Priority voting has been closed`);
        done(null);
      })
      .catch((error: Error) => {
        logger.error(`Project ${this.projectName} issue ${issueName}. Errors occurred during closing priority voting: ${error.message}`);
        done(error);
      });
  }

}

interface ContractMethodOptions {
  gasLimit?: string;
  gas?: string;
  from?: string;
}

interface LoadedWallet {
  address: string;
  entity: string;
  v3Wallet?: any;
}

export default EthController
