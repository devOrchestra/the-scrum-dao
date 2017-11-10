import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WorkerService } from '../worker.service'
import { Web3Service } from '../web3.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'


@Injectable()
export class WorkersResolverService {
  Project = contract(project_artifacts);
  workers = [];

  constructor(
    private _web3Service: Web3Service,
    private _workerService: WorkerService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    this._web3Service.getConnectionState().subscribe(connectionState => {
      if (connectionState && (connectionState === "connected" || connectionState === "none")) {
        let workersFinal = [];
        let holdersFinal = [];
        let workersLength;
        let holdersLength;
        this.Project.setProvider(web3.currentProvider);
        return this.Project.deployed()
          .then(contractInstance => {
            contractInstance.getWorkersLength.call()
              .then(data => {
                workersLength = parseInt(data.toString(), 10);
                const workersPromises = [];
                for (let i = 0; i < workersLength; i++) {
                  workersPromises.push(contractInstance.getWorker.call(i));
                }
                return Promise.all(workersPromises)
              })
              .then(value => {
                workersFinal = value;
                console.log('workersFinal', workersFinal);
                const balancePromises = [];
                for (let i = 0; i < workersLength; i++) {
                  balancePromises.push(contractInstance.balanceOf(value[i][0]))
                }
                return Promise.all(balancePromises)
              })
              .then(response => {
                workersFinal.forEach((item, i) => {
                  item.push(parseInt(response[i].toString(), 10))
                });
                this._workerService.setWorkers(workersFinal);
                console.log("Workers resolver data:", workersFinal);
                return contractInstance.getHoldersLength()
              })
              .then(holdersLengthResponse => {
                holdersLength = parseInt(holdersLengthResponse.toString(), 10);
                console.log('holdersLength', holdersLength);
                const holdersPromises = [];
                for (let i = 0; i < holdersLength; i++) {
                  holdersPromises.push(contractInstance.holders(i));
                }
                return Promise.all(holdersPromises)
              })
              .then(holdersResponse => {
                holdersFinal = holdersResponse;
                console.log('holdersFinal', holdersFinal);
              })
          });
      }
    })
  }
}
