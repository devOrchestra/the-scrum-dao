import Web3 = require('web3');
import EthereumTx = require('ethereumjs-tx');
import ethUtils = require('ethereumjs-util');
import Wallet = require('ethereumjs-wallet');
import contract = require('truffle-contract');
import fs = require('fs');
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
  }

  // FIELDS
  public projectName: string;
  private config: any;
  private web3: Web3;
  private projectContract;
  private planningPokerContact;
  private crowdsaleContract;
  private productBacklogContract;

  // METHODS
  public init(done): void {
    let walletData = require(path.resolve(this.config.ethereum.admin.walletPath));
    let adminWallet = Wallet.fromV3(walletData, this.config.ethereum.admin.walletPassword);

    let engine = new ProviderEngine();
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new WalletSubprovider(adminWallet, {}));
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(this.config.ethereum.url)));
    engine.start();
    this.web3 = new Web3(engine);

    let projectArtifact = require(path.resolve('./build/contracts/Project.json'));
    let planningPokerArtifact = require(path.resolve('./build/contracts/PlanningPoker.json'));
    let crowdsaleArtifact = require(path.resolve('./build/contracts/Crowdsale.json'));
    let productBacklogArtifact = require(path.resolve('./build/contracts/ProductBacklog.json'));

    let project = contract(projectArtifact);
    project.setProvider(this.web3.currentProvider);
    let planningPoker = contract(planningPokerArtifact);
    planningPoker.setProvider(this.web3.currentProvider);
    let crowdsale = contract(crowdsaleArtifact);
    crowdsale.setProvider(this.web3.currentProvider);
    let productBacklog = contract(productBacklogArtifact);
    productBacklog.setProvider(this.web3.currentProvider);

    Promise
      .all([
        project.deployed(),
        planningPoker.deployed(),
        crowdsale.deployed(),
        productBacklog.deployed()
      ])
      .then((contracts) => {
        this.projectContract = contracts[0];
        this.planningPokerContact = contracts[1];
        this.crowdsaleContract = contracts[2];
        this.productBacklogContract = contracts[3];
        logger.info(`Ethereum Controller has been connected to ${this.config.ethereum.url} and account 0x${adminWallet.getAddress().toString("hex")}`);
        done(null);
      })
      .catch((error) => {
        done(error);
      })

  }

  public createStoryPointsVoting(issueName: string, options: ContractMethodOptions, done): void {
    this.planningPokerContact
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
    this.planningPokerContact
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
    this.projectContract
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
    this.productBacklogContract
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
    this.productBacklogContract
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
}

export default EthController
