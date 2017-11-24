import { Injectable } from '@angular/core';
import projectBacklog_artifacts from '../../../../../build/contracts/ProductBacklog.json';
import {default as contract} from 'truffle-contract'

@Injectable()
export class ProjectBacklogService {
  ProjectBacklog = contract(projectBacklog_artifacts);
  projectBacklogContractInstance;

  constructor() { }

  addVoting(track: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.addVoting(track, {gas: 80000, from: web3.eth.accounts[0]});
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.addVoting(track, {gas: 80000, from: web3.eth.accounts[0]});
        });
    }
  }

  vote(issue: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.vote(issue, {gas: 155000, from: web3.eth.accounts[0]});
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.vote(issue, {gas: 155000, from: web3.eth.accounts[0]});
        });
    }
  }

  getVote(issue: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.getVote(issue, {from: web3.eth.accounts[0]});
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.getVote(issue, {from: web3.eth.accounts[0]});
        });
    }
  }

  getVoting(issue: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.getVoting(issue);
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.getVoting(issue);
        });
    }
  }

  deployProjectBacklogContract(): Promise<any> {
    this.ProjectBacklog.setProvider(web3.currentProvider);
    return this.ProjectBacklog.deployed()
      .then(projectBacklogContractInstanceResponse => {
        this.projectBacklogContractInstance = projectBacklogContractInstanceResponse;
      });
  }
}
