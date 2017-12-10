import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import gas_price from '../../../../../contracts/gas-price.json'
import {default as contract} from 'truffle-contract'
import 'rxjs/add/operator/toPromise';

@Injectable()
export class ProjectBacklogService {
  gasPrice = gas_price;
  getProjectBacklogContractInstance: Promise<any>;

  constructor(private _http: Http) {
    this.getProjectBacklogContractInstance = this.deployProjectBacklogContract();
  }

  addVoting(track: string): Promise<any> {
    return this.getProjectBacklogContractInstance
      .then(instance => {
        return instance.addVoting(track, {
          gas: this.gasPrice.productBacklogContract.addVoting * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  vote(issue: string): Promise<any> {
    return this.getProjectBacklogContractInstance
      .then(instance => {
        return instance.vote(issue, {
          gas: this.gasPrice.productBacklogContract.vote * 2,
          from: web3.eth.accounts[0]
        });
      });
  }

  getVote(issue: string): Promise<any> {
    return this.getProjectBacklogContractInstance
      .then(instance => {
        return instance.getVote(issue, {from: web3.eth.accounts[0]});
      });
  }

  getVoting(issue: string): Promise<any> {
    return this.getProjectBacklogContractInstance
      .then(instance => {
        return instance.getVoting(issue);
      });
  }

  deployProjectBacklogContract(): Promise<any> {
    return this.getArtifacts()
      .then(artifacts => {
        const ProjectBacklog = contract(artifacts);
        ProjectBacklog.setProvider(web3.currentProvider);
        return ProjectBacklog.deployed()
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
