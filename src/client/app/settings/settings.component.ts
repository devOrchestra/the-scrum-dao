import {Component, OnInit} from '@angular/core';
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  investor: String;
  worker: String;
  masterNew: String;
  investors: any[] = []
  workers: any[] = []
  master: String;
  Project = contract(project_artifacts);

  constructor() {
  }

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed().then(contractInstance => {
      contractInstance.getInvestorsLength.call().then(data => {
        const length = parseInt(data.toString(), 10);
        for (let i = 0; i < length; i++) {
          contractInstance.getInvestor.call(i).then(investor => {
            this.investors.push(investor)
          })
        }
      })

      contractInstance.getWorkersLength.call().then(data => {
        const length = parseInt(data.toString(), 10);
        for (let i = 0; i < length; i++) {
          contractInstance.getWorker.call(i).then(worker => {
            this.workers.push(worker)
          })
        }
      })

      contractInstance.master().then(data => {
        this.master = data
      })
    })


  }

  addInvestor() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addInvestor(this.investor, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getInvestorsLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getInvestor.call(length - 1).then(investor => {
            console.log(investor)
            this.investors.push(investor)
          })
        })
      })
    })
  }

  addWorker() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addWorker(this.worker, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getWorkersLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getWorker.call(length - 1).then(worker => {
            console.log(worker)
            this.workers.push(worker)
          })
        })
      })
    })
  }

  setMaster() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.setMaster(this.masterNew, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.master().then(data => {
          this.master = data;
        })
      })
    })
  }
}
