import {Component, OnInit} from '@angular/core';
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  worker: String;
  workers: any[] = [];
  contributors: any[] = [];
  newContributor: { [key: string]: string } = {};
  newOracleAddress: string;
  Project = contract(project_artifacts);

  constructor() {
  }

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed().then(contractInstance => {
      contractInstance.getWorkersLength.call().then(data => {
        const length = parseInt(data.toString(), 10);
        for (let i = 0; i < length; i++) {
          contractInstance.getWorker.call(i).then(worker => {
            this.workers.push(worker)
          })
        }
      })
    })
  }

  addWorker() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addWorker(this.worker, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getWorkersLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getWorker.call(length - 1).then(worker => {
            console.log(worker);
            this.workers.push(worker);
          })
        })
      })
    })
  }

  addContributor() {
    console.log("new contributor: ", this.newContributor);
  }

  addOracleAddress() {
    console.log("new oracle address: ", this.newOracleAddress);
  }
}
