import { Injectable } from '@angular/core';
import project_artifacts from '../../../../../build/contracts/Project.json';
import {default as contract} from 'truffle-contract'

@Injectable()
export class ProjectService {
  Project = contract(project_artifacts);
  projectContractInstance;

  constructor() { }

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
      return this.projectContractInstance.transfer(toAddress, value, {gas: 80000, from: web3.eth.accounts[0]});
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.transfer(toAddress, value, {gas: 80000, from: web3.eth.accounts[0]});
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
      return this.projectContractInstance.initCrowdsale(crowdsaleAddress, {from: web3.eth.accounts[0], gas: 35000});
    } else {
      return this.deployProjectContract()
        .then(() => {
          return this.projectContractInstance.initCrowdsale(crowdsaleAddress, {from: web3.eth.accounts[0], gas: 35000});
        });
    }
  }

  deployProjectContract(): Promise<any> {
    this.Project.setProvider(web3.currentProvider);
    return this.Project.deployed()
      .then(projectContractInstanceResponse => {
        this.projectContractInstance = projectContractInstanceResponse;
      });
  }
}
