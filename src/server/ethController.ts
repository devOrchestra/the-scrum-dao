import Web3 = require('web3');
import EthereumTx = require('ethereumjs-tx');
import ethUtils = require('ethereumjs-util');
import Wallet = require('ethereumjs-wallet');
import fs = require('fs');


class EthController {

  constructor(config) {
    this.web3 = new Web3(new Web3.providers.HttpProvider(config.ethereum.url));
    fs.readFile(config.ethereum.admin.walletPath, (error, data) => {
      this.adminKey = Wallet.fromV3(data.toString(), config.ethereum.admin.walletPassword).getPrivateKey().toString('hex');
    });
  }

  // FIELDS
  private config: any;
  private web3: Web3;
  private adminKey: string;

  // METHODS
  public sendTransaction(): void {
  }
}

export default EthController
