import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WorkerService } from '../worker.service'
import { Web3Service } from '../web3.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash'


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
        let decimals;
        let workersFinal = [];
        const holdersFinal = [];
        let holdersAddresses = [];
        let workersLength;
        let holdersLength;
        this.Project.setProvider(web3.currentProvider);
        return this.Project.deployed()
          .then(contractInstance => {
            contractInstance.getWorkersLength.call()
              .then(data => {
                workersLength = this.parseBigNumber(data);
                const workersPromises = [];
                for (let i = 0; i < workersLength; i++) {
                  workersPromises.push(contractInstance.getWorker.call(i));
                }
                return Promise.all(workersPromises);
              })
              .then(value => {
                workersFinal = value;
                console.log('workersFinal', workersFinal);
                const balancePromises = [];
                for (let i = 0; i < workersLength; i++) {
                  balancePromises.push(contractInstance.balanceOf(value[i][0]));
                }
                return Promise.all(balancePromises);
              })
              .then(response => {
                workersFinal.forEach((item, i) => {
                  item.push(this.parseBigNumber(response[i]));
                });
                this._workerService.setWorkers(workersFinal);
                console.log("Workers resolver data:", workersFinal);
                return contractInstance.decimals();
              })
              .then(decimalsResponse => {
                decimals = this.countDecimals(decimalsResponse);
                return contractInstance.getHoldersLength();
              })
              .then(holdersLengthResponse => {
                holdersLength = this.parseBigNumber(holdersLengthResponse);
                console.log('holdersLength', holdersLength);
                const holdersPromises = [];
                for (let i = 0; i < holdersLength; i++) {
                  holdersPromises.push(contractInstance.holders(i));
                }
                return Promise.all(holdersPromises)
              })
              .then(holdersResponse => {
                const balancePromises = [];
                holdersAddresses = holdersResponse;
                // holdersAddresses = _.remove(_.cloneDeep(holdersResponse), holder => {
                //   let isNotInWorkers = true;
                //   workersFinal.forEach(worker => {
                //     if (holder === worker[0]) {
                //       isNotInWorkers = false;
                //     }
                //   });
                //   return isNotInWorkers;
                // });
                for (let i = 0; i < holdersLength; i++) {
                  balancePromises.push(contractInstance.balanceOf(holdersResponse[i]))
                }
                return Promise.all(balancePromises);
              })
              .then(balancePromisesResponse => {
                holdersAddresses.forEach((item, i) => {
                  holdersFinal.push([item, this.parseBigNumber(balancePromisesResponse[i]) / decimals]);
                });
                this._workerService.setHolders(holdersFinal);
                console.log('holdersFinal', holdersFinal);
              })
          });
      }
    })
  }

  countDecimals(numberOfNulls: number): number {
    let final = "1";
    const parsedNumberOfNulls = this.parseBigNumber(numberOfNulls);
    for (let i = 0; i < parsedNumberOfNulls; i++) {
      final += "0";
    }
    return Number(final)
  }

  parseBigNumber(item: number): number {
    return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
  }
}
