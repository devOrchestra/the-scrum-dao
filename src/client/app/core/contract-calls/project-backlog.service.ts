import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../credentials/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectBacklogService {
  ProjectBacklog;
  projectBacklogContractInstance;
  gasPrice = gas_price;

  constructor(
    private _http: Http
  ) { }

  addVoting(track: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.addVoting(track, {
        gas: this.gasPrice.productBacklogContract.addVoting * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.addVoting(track, {
            gas: this.gasPrice.productBacklogContract.addVoting * 2,
            from: web3.eth.accounts[0]
          });
        });
    }
  }

  vote(issue: string): Promise<any> {
    if (this.projectBacklogContractInstance) {
      return this.projectBacklogContractInstance.vote(issue, {
        gas: this.gasPrice.productBacklogContract.vote * 2,
        from: web3.eth.accounts[0]
      });
    } else {
      return this.deployProjectBacklogContract()
        .then(() => {
          return this.projectBacklogContractInstance.vote(issue, {
            gas: this.gasPrice.productBacklogContract.vote * 2,
            from: web3.eth.accounts[0]
          });
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
    return this.getArtifacts()
      .then(artifacts => {
        this.ProjectBacklog = contract(artifacts);
        this.ProjectBacklog.setProvider(web3.currentProvider);
        return this.ProjectBacklog.deployed()
      })
      .then(projectBacklogContractInstanceResponse => {
        this.projectBacklogContractInstance = projectBacklogContractInstanceResponse;
      })
      .catch(err => {
        console.error("An error occurred in crowdsale.service while trying to deployProjectBacklogContract", err);
      });
  }

  getArtifacts() {
    return this._http.get(`/static/artifacts/ProductBacklog.json`)
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
