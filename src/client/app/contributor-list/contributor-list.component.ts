import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { WorkerService } from '../core/worker.service';
import { ProjectService } from '../core/contract-calls/project.service'
import { ShortEnterAnimation } from '../shared/animations'
import { countDecimals, parseBigNumber } from '../shared/methods'
import { IContributor, IHolder } from "../shared/interfaces";

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

  constructor(
    private _titleService: Title,
    private _workerService: WorkerService,
    private _projectService: ProjectService
  ) { this._titleService.setTitle('Scrum DAO - Contributor list'); }

  ngOnInit() {
    let workersWereSet = false;
    this._workerService.getWorkers().subscribe(data => {
      this._workerService.getHolders().subscribe(holders => {
        if (data && holders) {
          let currentWorkersArr;
          const clone = [];
          holders.forEach((item, i) => {
            this.holders[i] = this.formatHolders(item);
          });
          currentWorkersArr = data;
          data.forEach(item => {
            clone.push(item);
          });
          clone.forEach((item, i) => {
            clone[i] = this.formatWorkers(item);
          });
          if (!this._workerService.workersAvatarsWereSet && !workersWereSet) {
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
                this._workerService.setWorkers(currentWorkersArr);
                workersWereSet = true;
              })
              .catch(err => {
                console.error('An error occurred on contributor-list.component in "OnInit" block:', err);
              });
          } else {
            this.contributors = clone;
            this.totalBalance = this._workerService.getTotalBalance();
            this._projectService.symbol()
              .then(symbol => {
                this.tokenSymbol = symbol;
                this.readyToRenderPage = true;
              })
              .catch(err => {
                console.error('An error occurred on contributor-list.component in "OnInit" block:', err);
              });
          }
        }
      })
    });
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
