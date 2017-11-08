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
        let final = [];
        let length;
        this.Project.setProvider(web3.currentProvider);
        return this.Project.deployed()
          .then(contractInstance => {
            contractInstance.getWorkersLength.call()
              .then(data => {
                length = parseInt(data.toString(), 10);
                const workerPromises = [];
                for (let i = 0; i < length; i++) {
                  workerPromises.push(contractInstance.getWorker.call(i));
                }
                return Promise.all(workerPromises)
              })
              .then(value => {
                final = value;
                const balancePromises = [];
                for (let i = 0; i < length; i++) {
                  balancePromises.push(contractInstance.balanceOf(value[i][0]))
                }
                return Promise.all(balancePromises)
              })
              .then(response => {
                final.forEach((item, i) => {
                  item.push(parseInt(response[i].toString(), 10))
                });
                this._workerService.setWorkers(final);
                console.log("Workers resolver data:", final);
              })
          });
      }
    })
  }
}
