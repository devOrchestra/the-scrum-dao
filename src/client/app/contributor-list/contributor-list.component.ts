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
        this._workerService.getContributors().then(response => {
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
          this._workerService.setWorkers(currentWorkersArr);
          this.contributors = clone;
          this.readyToRenderPage = true;
        })
      } else {
        this.contributors = clone;
        this.readyToRenderPage = true;
      }
    });

    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstance => {
        return contractInstance.totalSupply();
      })
      .then(data => {
        this.totalBalance = parseInt(data.toString(), 10);
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
    const calcVal = (contributorBalance * 100 / this.totalBalance).toFixed(2);
    const finalPercentsVal = parseInt(calcVal.toString(), 10);
    if (isNaN(finalPercentsVal)) {
      return 0;
    } else {
      return finalPercentsVal;
    }
  }
}
