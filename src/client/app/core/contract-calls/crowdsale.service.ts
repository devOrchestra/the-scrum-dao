import { Injectable } from '@angular/core';
import gas_price from '../../../../../credentials/gas-price.json'
import crowdsale_artifacts from '../../../../../build/contracts/Crowdsale.json';
import {default as contract} from 'truffle-contract'

@Injectable()
export class CrowdsaleService {
  Crowdsale = contract(crowdsale_artifacts);
  crowdsaleContractInstance;
  gasPrice = gas_price;

  constructor() { }

  getBuyOrder(index: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.getBuyOrder.call(index);
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.getBuyOrder.call(index);
        });
    }
  }

  getBuyOrderLength(): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.getBuyOrderLength();
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.getBuyOrderLength();
        });
    }
  }

  getSellOrder(index: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.getSellOrder.call(index);
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.getSellOrder.call(index);
        });
    }
  }

  getSellOrderLength(): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.getSellOrderLength();
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.getSellOrderLength();
        });
    }
  }

  addBuyOrder(price: number, value: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.addBuyOrder(price, {
        gas: this.gasPrice.crowdsaleContract.addBuyOrder * 2,
        from: web3.eth.accounts[0],
        value: value
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.addBuyOrder(price, {
            gas: this.gasPrice.crowdsaleContract.addBuyOrder * 2,
            from: web3.eth.accounts[0],
            value: value
          });
        });
    }
  }

  addSellOrder(value: number, price: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.addSellOrder(value, price, {
        gas: this.gasPrice.crowdsaleContract.addSellOrder * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.addSellOrder(value, price, {
            gas: this.gasPrice.crowdsaleContract.addSellOrder * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  buy(id: number, value: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.buy(id, {
        gas: this.gasPrice.crowdsaleContract.buy * 2,
        from: web3.eth.accounts[0],
        value
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.buy(id, {
            gas: this.gasPrice.crowdsaleContract.buy * 2,
            from: web3.eth.accounts[0],
            value
          });
        });
    }
  }

  sell(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.sell(id, {
        gas: this.gasPrice.crowdsaleContract.sell * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.sell(id, {
            gas: this.gasPrice.crowdsaleContract.sell * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  closeSellOrder(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.closeSellOrder(id, {
        gas: this.gasPrice.crowdsaleContract.closeSellOrder * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.closeSellOrder(id, {
            gas: this.gasPrice.crowdsaleContract.closeSellOrder * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  closeBuyOrder(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.closeBuyOrder(id, {
        gas: this.gasPrice.crowdsaleContract.closeBuyOrder * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.closeBuyOrder(id, {
            gas: this.gasPrice.crowdsaleContract.closeBuyOrder * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  deployCrowdsaleContract(): Promise<any> {
    this.Crowdsale.setProvider(web3.currentProvider);
    return this.Crowdsale.deployed()
      .then(crowdsaleContractInstanceResponse => {
        this.crowdsaleContractInstance = crowdsaleContractInstanceResponse;
      });
  }
}
