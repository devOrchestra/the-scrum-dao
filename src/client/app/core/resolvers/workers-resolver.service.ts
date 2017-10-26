import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WorkerService } from '../worker.service'
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'


@Injectable()
export class WorkersResolverService {
  Project = contract(project_artifacts);
  workers = [];

  constructor(
    private _workerService: WorkerService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    this.Project.setProvider(web3.currentProvider);
    return this.Project.deployed().then(contractInstance => {
      return contractInstance.getWorkersLength.call().then(data => {
        const length = parseInt(data.toString(), 10);
        const promises = [];
        for (let i = 0; i < length; i++) {
          promises.push(contractInstance.getWorker.call(i));
        }
        Promise.all(promises).then(value => {
          console.log("Workers resolver data:", value);
          this._workerService.setWorkers(value);
        });
      });
    });
  }
}
