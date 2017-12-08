import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../credentials/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService {
  Project;
  projectContractInstance;
  gasPrice = gas_price;

  constructor(
    private _http: Http
  ) { }

  decimals(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.decimals();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.decimals();
        });
    }
  }

  symbol(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.symbol();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.symbol();
        });
    }
  }

  totalSupply(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.totalSupply();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.totalSupply();
        });
    }
  }

  trustedOracle(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.trustedOracle();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.trustedOracle();
        });
    }
  }

  crowdsale(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.crowdsale();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.crowdsale();
        });
    }
  }

  balanceOf(address?: string): Promise<any> {
    if (this.projectContractInstance) {
      return address ? this.projectContractInstance.balanceOf(address) : this.projectContractInstance.balanceOf(web3.eth.accounts[0]);
    } else {
      return this.deployProjectContract()
        .then(() => {
          return address ? this.projectContractInstance.balanceOf(address) : this.projectContractInstance.balanceOf(web3.eth.accounts[0]);
        });
    }
  }

  transfer(toAddress: string, value: number): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.transfer(toAddress, value, {
        gas: this.gasPrice.projectContract.transfer * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.transfer(toAddress, value, {
            gas: this.gasPrice.projectContract.transfer * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  addWorker(address: string, login: string): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.addWorker(address, login, {from: web3.eth.accounts[0]});
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.addWorker(address, login, {from: web3.eth.accounts[0]});
        });
    }
  }

  getWorkersLength(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.getWorkersLength.call();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.getWorkersLength.call();
        });
    }
  }

  getHoldersLength(): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.getHoldersLength();
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.getHoldersLength();
        });
    }
  }

  holders(index: number): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.holders(index);
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.holders(index);
        });
    }
  }

  getWorker(index: number): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.getWorker.call(index);
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.getWorker.call(index);
        });
    }
  }

  initCrowdsale(crowdsaleAddress: string): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.initCrowdsale(crowdsaleAddress, {
        from: web3.eth.accounts[0],
        gas: this.gasPrice.projectContract.initCrowdsale * 2
      });
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.initCrowdsale(crowdsaleAddress, {
            from: web3.eth.accounts[0],
            gas: this.gasPrice.projectContract.initCrowdsale * 2
          });
        });
    }
  }

  initPlanningPoker(planningPokerAddress: string): Promise<any> {
    if (this.projectContractInstance) {
      return this.projectContractInstance.initPlanningPoker(planningPokerAddress, {
        from: web3.eth.accounts[0],
        gas: this.gasPrice.projectContract.initPlanningPoker * 2
      });
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.initPlanningPoker(planningPokerAddress, {
            from: web3.eth.accounts[0],
            gas: this.gasPrice.projectContract.initPlanningPoker * 2
          });
        });
    }
  }

  deployProjectContract(): Promise<any> {
    return this.getArtifacts()
      .then(artifacts => {
        this.Project = contract(artifacts);
        this.Project.setProvider(web3.currentProvider);
        return this.Project.deployed();
      })
      .then(projectContractInstanceResponse => {
        this.projectContractInstance = projectContractInstanceResponse;
      })
      .catch(err => {
        console.error("An error occurred in project.service while trying to deployProjectContract", err);
      });
  }

  getArtifacts() {
    return this._http.get(`/static/artifacts/Project.json`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (ProjectService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
