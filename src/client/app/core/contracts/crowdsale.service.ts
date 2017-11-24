import { Injectable } from '@angular/core';
import crowdsale_artifacts from '../../../../../build/contracts/Crowdsale.json';
import {default as contract} from 'truffle-contract'
import {gas} from '../../shared/methods'

@Injectable()
export class CrowdsaleService {
  Crowdsale = contract(crowdsale_artifacts);
  crowdsaleContractInstance;
  gas = gas;

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
      return this.crowdsaleContractInstance.addBuyOrder(price, {gas: this.gas, from: web3.eth.accounts[0], value: value});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.addBuyOrder(price, {gas: this.gas, from: web3.eth.accounts[0], value: value});
        });
    }
  }

  addSellOrder(value: number, price: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.addSellOrder(value, price, {gas: this.gas, from: web3.eth.accounts[0]});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.addSellOrder(value, price, {gas: this.gas, from: web3.eth.accounts[0]});
        });
    }
  }

  buy(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.buy(id, {gas: this.gas, from: web3.eth.accounts[0]});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.buy(id, {gas: this.gas, from: web3.eth.accounts[0]});
        });
    }
  }

  sell(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.sell(id, {gas: this.gas, from: web3.eth.accounts[0]});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.sell(id, {gas: this.gas, from: web3.eth.accounts[0]});
        });
    }
  }

  closeSellOrder(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.closeSellOrder(id, {gas: this.gas, from: web3.eth.accounts[0]});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.closeSellOrder(id, {gas: this.gas, from: web3.eth.accounts[0]});
        });
    }
  }

  closeBuyOrder(id: number): Promise<any> {
    if (this.crowdsaleContractInstance) {
      return this.crowdsaleContractInstance.closeBuyOrder(id, {gas: this.gas, from: web3.eth.accounts[0]});
    } else {
      return this.deployCrowdsaleContract()
        .then(() => {
          return this.crowdsaleContractInstance.closeBuyOrder(id, {gas: this.gas, from: web3.eth.accounts[0]});
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
