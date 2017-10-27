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
  public totalBalance: number;
  public contributors;

  constructor(
    private _workerService: WorkerService
  ) { }

  ngOnInit() {
    this._workerService.getWorkers().subscribe(data => {
      data.forEach((item, i) => {
        data[i] = this.formatWorkers(item)
      });
      this.contributors = data;
    });

    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed().then(contractInstance => {
      contractInstance.totalSupply().then(data => {
        this.totalBalance = parseInt(data.toString(), 10);
      })
    })
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
