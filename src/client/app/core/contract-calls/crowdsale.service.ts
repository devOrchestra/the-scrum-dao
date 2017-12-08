import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../credentials/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class CrowdsaleService {
  Crowdsale;
  crowdsaleContractInstance;
  gasPrice = gas_price;

  constructor(
    private _http: Http
  ) { }

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
    return this.getArtifacts()
      .then(artifacts => {
        this.Crowdsale = contract(artifacts);
        this.Crowdsale.setProvider(web3.currentProvider);
        return this.Crowdsale.deployed()
      })
      .then(crowdsaleContractInstanceResponse => {
        this.crowdsaleContractInstance = crowdsaleContractInstanceResponse;
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
