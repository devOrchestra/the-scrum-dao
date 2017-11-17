import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WorkerService } from '../worker.service'
import { Web3Service } from '../web3.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import { parseBigNumber, countDecimals } from '../../shared/methods'
import * as _ from 'lodash'


@Injectable()
export class WorkersResolverService {
  Project = contract(project_artifacts);

  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  workers = [];

  constructor(
    private _web3Service: Web3Service,
    private _workerService: WorkerService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    this._web3Service.getConnectionState().subscribe(connectionState => {
      if (connectionState && (connectionState === "connected" || connectionState === "none")) {
        let contractInstance;
        let decimals;
        let workersFinal = [];
        const holdersFinal = [];
        let holdersAddresses = [];
        let workersLength;
        let holdersLength;
        this.Project.setProvider(web3.currentProvider);
        return this.Project.deployed()
          .then(contractInstanceResponse => {
            contractInstance = contractInstanceResponse;
            return contractInstance.getWorkersLength.call();
          })
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
            return contractInstance.decimals();
          })
          .then(decimalsResponse => {
            decimals = this.countDecimals(decimalsResponse);
            return contractInstance.getHoldersLength();
          })
          .then(holdersLengthResponse => {
            holdersLength = this.parseBigNumber(holdersLengthResponse);
            const holdersPromises = [];
            for (let i = 0; i < holdersLength; i++) {
              holdersPromises.push(contractInstance.holders(i));
            }
            return Promise.all(holdersPromises)
          })
          .then(holdersResponse => {
            const balancePromises = [];
            holdersAddresses = _.remove(_.cloneDeep(holdersResponse), holder => {
              let isNotInWorkers = true;
              workersFinal.forEach(worker => {
                if (holder === worker[0]) {
                  isNotInWorkers = false;
                }
              });
              return isNotInWorkers;
            });
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
          })
          .catch(err => {
            console.error('An error occurred on workers-resolver.service:', err);
          });
      }
    })
  }
}
