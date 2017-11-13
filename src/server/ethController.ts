import Web3 = require('web3');
import EthereumTx = require('ethereumjs-tx');
import ethUtils = require('ethereumjs-util');
import Wallet = require('ethereumjs-wallet');
import fs = require('fs');
import path = require('path');
import ProviderEngine = require("web3-provider-engine");
import WalletSubprovider = require('web3-provider-engine/subproviders/wallet.js');
import Web3Subprovider = require("web3-provider-engine/subproviders/web3.js");
import FilterSubprovider = require('web3-provider-engine/subproviders/filters.js');
import Promise = require('bluebird');


class EthController {

  constructor(config) {
    this.config = config;
  }

  // FIELDS
  private config: any;
  private web3: Web3;
  private projectContract;
  private planningPokerContact;
  private crowdsaleContract;
  private productBacklogContract;

  // METHODS
  public init(done): void {
    walletData = require(this.config.ethereum.admin.walletPath);
    let adminWallet = Wallet.fromV3(walletData.toString(), config.ethereum.admin.walletPassword);

    let engine = new ProviderEngine();
    engine.addProvider(new FilterSubprovider());
    engine.addProvider(new WalletSubprovider(adminWallet, {}));
    engine.addProvider(new Web3Subprovider(new Web3.providers.HttpProvider(this.config.ethereum.url)));
    engine.start();
    this.web3 = new Web3(engine);

    let projectArtifact = require(path.resolve('./build/contracts/Project.json'));
    let storyPointsVotingArtifact = require(path.resolve('./build/contracts/StoryPointsVoting.json'));
    let crowdsaleArtifact = require(path.resolve('./build/contracts/Crowdsale.json'));
    let productBacklogArtifact = require(path.resolve('./build/contracts/ProductBacklog.json'));

    let project = contract(projectArtifact);
    project.setProvider(this.web3.currentProvider);
    let storyPointsVoting = contract(storyPointsVotingArtifact);
    storyPointsVoting.setProvider(this.web3.currentProvider);
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
        done(null);
      })
      .catch((error) => {
        done(error);
      })

  }


  public sendTransaction(): void {
  }
}

export default EthController
