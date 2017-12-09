import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../credentials/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectService {
  gasPrice = gas_price;
  getProjectContractInstance: Promise<any>;

  constructor(private _http: Http) {
    this.getProjectContractInstance = this.deployProjectContract();
  }

  decimals(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.decimals();
      });
  }

  symbol(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.symbol();
      });
  }

  totalSupply(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.totalSupply();
      });
  }

  trustedOracle(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.trustedOracle();
      });
  }

  crowdsale(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.crowdsale();
      });
  }

  balanceOf(address?: string): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return address ? instance.balanceOf(address) : instance.balanceOf(web3.eth.accounts[0]);
      });
  }

  transfer(toAddress: string, value: number): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.transfer(toAddress, value, {
          gas: this.gasPrice.projectContract.transfer * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  addWorker(address: string, login: string): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.addWorker(address, login, {from: web3.eth.accounts[0]});
      });
  }

  getWorkersLength(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.getWorkersLength.call();
      });
  }

  getHoldersLength(): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.getHoldersLength();
      });
  }

  holders(index: number): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.holders(index);
      });
  }

  getWorker(index: number): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.getWorker.call(index);
      });
  }

  initCrowdsale(crowdsaleAddress: string): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.initCrowdsale(crowdsaleAddress, {
          from: web3.eth.accounts[0],
          gas: this.gasPrice.projectContract.initCrowdsale * 2
        });
      });
  }

  initPlanningPoker(planningPokerAddress: string): Promise<any> {
    return this.getProjectContractInstance
      .then(instance => {
        return instance.initPlanningPoker(planningPokerAddress, {
          from: web3.eth.accounts[0],
          gas: this.gasPrice.projectContract.initPlanningPoker * 2
        });
      });
  }

  initWatchingEvents() {
    return this.getProjectContractInstance;
  }

  deployProjectContract(): Promise<any> {
    return this.getArtifacts()
      .then(artifacts => {
        const Project = contract(artifacts);
        Project.setProvider(web3.currentProvider);
        return Project.deployed();
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
