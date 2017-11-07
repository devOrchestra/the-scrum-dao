import { Component, OnInit } from '@angular/core';
import { WorkerService } from '../core/worker.service';
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Component({
  selector: 'app-contributor-list',
  templateUrl: './contributor-list.component.html',
  styleUrls: ['./contributor-list.component.css']
})
export class ContributorListComponent implements OnInit {
  Project = contract(project_artifacts);
  public readyToRenderPage = false;
  public totalBalance: number;
  public contributors;
  public tokenSymbol: string;
  public decimals: number;

  constructor(
    private _workerService: WorkerService
  ) { }

  ngOnInit() {
    this._workerService.getWorkers().subscribe(data => {
      const currentWorkersArr = data;
      const clone = [];
      data.forEach(item => {
        clone.push(item);
      });
      clone.forEach((item, i) => {
        clone[i] = this.formatWorkers(item)
      });

      if (!this._workerService.workersAvatarsWereSet) {
        this._workerService.getContributors()
          .then(response => {
            response.forEach((responseItem, i) => {
              clone.forEach((cloneItem, j) => {
                if (responseItem.displayName.toLowerCase() === cloneItem.username.toLowerCase() ||
                  responseItem.name.toLowerCase() === cloneItem.username.toLowerCase()) {
                  cloneItem.avatar = responseItem.avatarUrl;
                  currentWorkersArr[j].push(responseItem.avatarUrl);
                }
              });
            });
            this._workerService.workersAvatarsWereSet = true;
            this.contributors = clone;
            this.Project.setProvider(web3.currentProvider);
            return this.Project.deployed();
          })
          .then(contractInstance => {
            contractInstance.totalSupply()
              .then(totalSupplyResponse => {
                this.totalBalance = this.parseBigNumber(totalSupplyResponse);
                return contractInstance.symbol()
              })
              .then(symbol => {
                this.tokenSymbol = symbol;
                return contractInstance.decimals();
              })
              .then(decimalsResponse => {
                this.decimals = this.countDecimals(decimalsResponse);
                this.totalBalance = this.totalBalance / this.decimals;
                this._workerService.setTotalBalance(this.totalBalance);
                this.contributors.forEach(item => {
                  item.balance = item.balance / this.decimals;
                });
                currentWorkersArr.forEach(item => {
                  item[2] = item[2] / this.decimals;
                });
                this._workerService.setWorkers(currentWorkersArr);
              })
          })
      } else {
        this.contributors = clone;
        this.totalBalance = this._workerService.getTotalBalance();
        setTimeout(() => {
          this.readyToRenderPage = true;
        }, 100);
      }
    });
  }

  formatWorkers(arr) {
    const obj = {
      walletAddress: null,
      username: null,
      balance: null,
      avatar: null
    };
    let count = 0;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (arr[count] !== undefined) {
          obj[prop] = arr[count];
          count++
        }
      }
    }
    return obj;
  }

  countBalance(contributorBalance) {
    console.log('contributorBalance', contributorBalance);
    console.log('this.totalBalance', this.totalBalance);
    const calcVal = (contributorBalance * 100 / this.totalBalance).toFixed(2);
    const finalPercentsVal = parseInt(calcVal.toString(), 10);
    if (isNaN(finalPercentsVal)) {
      return 0;
    } else {
      return finalPercentsVal;
    }
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
