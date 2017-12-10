import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../contracts/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CrowdsaleService {
  gasPrice = gas_price;
  getCrowdsaleContractInstance: Promise<any>;

  constructor(private _http: Http) {
    this.getCrowdsaleContractInstance = this.deployCrowdsaleContract();
  }

  getBuyOrder(index: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.getBuyOrder.call(index);
      });
  }

  getBuyOrderLength(): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.getBuyOrderLength();
      });
  }

  getSellOrder(index: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.getSellOrder.call(index);
      });
  }

  getSellOrderLength(): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.getSellOrderLength();
      });
  }

  addBuyOrder(price: number, value: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.addBuyOrder(price, {
          gas: this.gasPrice.crowdsaleContract.addBuyOrder * 2,
          from: web3.eth.accounts[0],
          value: value
        });
      });
  }

  addSellOrder(value: number, price: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.addSellOrder(value, price, {
          gas: this.gasPrice.crowdsaleContract.addSellOrder * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  buy(id: number, value: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.buy(id, {
          gas: this.gasPrice.crowdsaleContract.buy * 2,
          from: web3.eth.accounts[0],
          value
        });
      });
  }

  sell(id: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.sell(id, {
          gas: this.gasPrice.crowdsaleContract.sell * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  closeSellOrder(id: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.closeSellOrder(id, {
          gas: this.gasPrice.crowdsaleContract.closeSellOrder * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  closeBuyOrder(id: number): Promise<any> {
    return this.getCrowdsaleContractInstance
      .then(instance => {
        return instance.closeBuyOrder(id, {
          gas: this.gasPrice.crowdsaleContract.closeBuyOrder * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  deployCrowdsaleContract(): Promise<any> {
    return this.getArtifacts()
      .then(artifacts => {
        const Crowdsale = contract(artifacts);
        Crowdsale.setProvider(web3.currentProvider);
        return Crowdsale.deployed()
      })
      .catch(err => {
        console.error("An error occurred in crowdsale.service while trying to get artifacts", err);
      });
  }

  getArtifacts() {
    return this._http.get(`/static/artifacts/Crowdsale.json`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (CrowdsaleService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
