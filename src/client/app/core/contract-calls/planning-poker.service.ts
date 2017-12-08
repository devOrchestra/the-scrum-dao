import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../credentials/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class PlanningPokerService {
  PlanningPoker;
  planningPokerContractInstance;
  gasPrice = gas_price;

  constructor(
    private _http: Http
  ) { }

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
    return this.getArtifacts()
      .then(artifacts => {
        this.PlanningPoker = contract(artifacts);
        this.PlanningPoker.setProvider(web3.currentProvider);
        return this.PlanningPoker.deployed();
      })
      .then(planningPokerContractInstanceResponse => {
        this.planningPokerContractInstance = planningPokerContractInstanceResponse;
      })
      .catch(err => {
        console.error("An error occurred in planning-poker.service while trying to deployPlanningPokerContract", err);
      });
  }

  getArtifacts() {
    return this._http.get(`/static/artifacts/PlanningPoker.json`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (PlanningPokerService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
