import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WorkerService } from '../core/worker.service';
import { ProjectService } from '../core/contract-calls/project.service'
import { ShortEnterAnimation } from '../shared/animations'
import { countDecimals, parseBigNumber } from '../shared/methods'
import { IContributor, IHolder } from "../shared/interfaces";
import * as _ from 'lodash'

@Component({
  selector: 'app-contributor-list',
  templateUrl: './contributor-list.component.html',
  styleUrls: ['./contributor-list.component.css'],
  animations: [ShortEnterAnimation]
})
export class ContributorListComponent implements OnInit {
  countDecimals = countDecimals;
  parseBigNumber = parseBigNumber;

  public readyToRenderPage = false;
  public totalBalance: number;
  public contributors: IContributor[];
  public holders: IHolder[] = [];
  public tokenSymbol: string;
  public decimals: number;

  /* Helpers */
  public workersFinal = [];
  public holdersFinal = [];

  constructor(
    private _titleService: Title,
    private _workerService: WorkerService,
    private _projectService: ProjectService
  ) {
    const currentTitle = this._titleService.getTitle(),
          neededTitle = 'Scrum DAO - Contributor list';
    if (currentTitle !== neededTitle) {
      this._titleService.setTitle(neededTitle);
    }
  }

  ngOnInit() {
    let currentWorkersArr;
    const clone = [];
    this.getWorkers()
      .then(() => this.getHolders())
      .then(() => {
        this.holdersFinal.forEach((item, i) => {
          this.holders[i] = this.formatHolders(item);
        });
        currentWorkersArr = this.workersFinal;
        this.workersFinal.forEach(item => {
          clone.push(item);
        });
        clone.forEach((item, i) => {
          clone[i] = this.formatWorkers(item);
        });
        return this._workerService.getContributors();
      })
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
        this.contributors = clone;
        return this._projectService.totalSupply();
      })
      .then(totalSupplyResponse => {
        this.totalBalance = this.parseBigNumber(totalSupplyResponse);
        return this._projectService.symbol()
      })
      .then(symbol => {
        this.tokenSymbol = symbol;
        return this._projectService.decimals();
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
        this.readyToRenderPage = true;
      })
      .catch(err => {
        console.error('An error occurred on contributor-list.component in "OnInit" block:', err);
      });
  }

  getWorkers(): Promise<any> {
    let workersLength;
    return this._projectService.getWorkersLength()
      .then(data => {
        workersLength = this.parseBigNumber(data);
        const workersPromises = [];
        for (let i = 0; i < workersLength; i++) {
          workersPromises.push(this._projectService.getWorker(i));
        }
        return Promise.all(workersPromises);
      })
      .then(value => {
        this.workersFinal = value;
        const balancePromises = [];
        for (let i = 0; i < workersLength; i++) {
          balancePromises.push(this._projectService.balanceOf(value[i][0]));
        }
        return Promise.all(balancePromises);
      })
      .then(response => {
        this.workersFinal.forEach((item, i) => {
          item.push(this.parseBigNumber(response[i]));
        });
      })
  }

  getHolders(): Promise<any> {
    let decimals;
    let holdersAddresses = [];
    let holdersLength;
    return this._projectService.decimals()
      .then(decimalsResponse => {
        decimals = this.countDecimals(decimalsResponse);
        return this._projectService.getHoldersLength();
      })
      .then(holdersLengthResponse => {
        holdersLength = this.parseBigNumber(holdersLengthResponse);
        const holdersPromises = [];
        for (let i = 0; i < holdersLength; i++) {
          holdersPromises.push(this._projectService.holders(i));
        }
        return Promise.all(holdersPromises)
      })
      .then(holdersResponse => {
        const balancePromises = [];
        holdersAddresses = _.remove(_.cloneDeep(holdersResponse), holder => {
          let isNotInWorkers = true;
          this.workersFinal.forEach(worker => {
            if (holder === worker[0]) {
              isNotInWorkers = false;
            }
          });
          return isNotInWorkers;
        });
        for (let i = 0; i < holdersLength; i++) {
          balancePromises.push(this._projectService.balanceOf(holdersResponse[i]))
        }
        return Promise.all(balancePromises);
      })
      .then(balancePromisesResponse => {
        holdersAddresses.forEach((item, i) => {
          this.holdersFinal.push([item, this.parseBigNumber(balancePromisesResponse[i]) / decimals]);
        });
      })
  }

  formatWorkers(itemArr: string | number[]): IContributor {
    const obj = {
      walletAddress: null,
      username: null,
      balance: null,
      avatar: null
    };
    let count = 0;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (itemArr[count] !== undefined) {
          obj[prop] = itemArr[count];
          count++
        }
      }
    }
    return obj;
  }

  formatHolders(itemArr): IHolder {
    const obj = {
      walletAddress: null,
      balance: null,
    };
    let count = 0;
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (itemArr[count] !== undefined) {
          obj[prop] = itemArr[count];
          count++
        }
      }
    }
    return obj;
  }

  countBalance(contributorBalance: number): number {
    const calcVal = (contributorBalance * 100 / this.totalBalance).toFixed(2);
    const finalPercentsVal = parseInt(calcVal.toString(), 10);
    if (isNaN(finalPercentsVal)) {
      return 0;
    } else {
      return finalPercentsVal;
    }
  }
}
