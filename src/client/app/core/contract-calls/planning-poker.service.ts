import { Injectable } from '@angular/core';
import gas_price from '../../../../../credentials/gas-price.json'
import planningPoker_artifacts from '../../../../../build/contracts/PlanningPoker.json';
import {default as contract} from 'truffle-contract'

@Injectable()
export class PlanningPokerService {
  PlanningPoker = contract(planningPoker_artifacts);
  planningPokerContractInstance;
  gasPrice = gas_price;

  constructor() { }

  vote(issue: string, points: number): Promise<any> {
    if (this.planningPokerContractInstance) {
      return this.planningPokerContractInstance.vote(issue, points, {
        from: web3.eth.accounts[0],
        gas: this.gasPrice.planningPokerContract.vote * 2
      });
    } else {
      return this.deployPlanningPokerContract()
        .then(() => {
          return this.planningPokerContractInstance.vote(issue, points, {
            from: web3.eth.accounts[0],
            gas: this.gasPrice.planningPokerContract.vote * 2
          });
        });
    }
  }

  getVote(issue: string): Promise<any> {
    if (this.planningPokerContractInstance) {
      return this.planningPokerContractInstance.getVote(issue, {from: web3.eth.accounts[0]})
    } else {
      return this.deployPlanningPokerContract()
        .then(() => {
          return this.planningPokerContractInstance.getVote(issue, {from: web3.eth.accounts[0]})
        });
    }
  }

  getVoting(issue: string): Promise<any> {
    if (this.planningPokerContractInstance) {
      return this.planningPokerContractInstance.getVoting(issue);
    } else {
      return this.deployPlanningPokerContract()
        .then(() => {
          return this.planningPokerContractInstance.getVoting(issue);
        });
    }
  }

  deployPlanningPokerContract(): Promise<any> {
    this.PlanningPoker.setProvider(web3.currentProvider);
    return this.PlanningPoker.deployed()
      .then(planningPokerContractInstanceResponse => {
        this.planningPokerContractInstance = planningPokerContractInstanceResponse;
      });
  }
}
