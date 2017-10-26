import {Component, OnInit} from '@angular/core';
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  worker: any = {};
  workers: any[] = [];
  newOracleAddress: string;
  Project = contract(project_artifacts);

  constructor() {
  }

  ngOnInit() {
    // todo Load users in resolvers before app route. store in a service
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

      contractInstance.trustedOracle().then(data => {
        // todo display
        console.log('ORACLE', data)
      })
    })
  }

  addWorker() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addWorker(this.worker.address, this.worker.login, {
        from: web3.eth.accounts[0]
      }).then(() => {
        contractInstance.getWorkersLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getWorker.call(length - 1).then(worker => {
            this.workers.push(worker)
          })
        })
      })
    })
  }


  addOracleAddress() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addTrustedOracle(this.newOracleAddress, {
        from: web3.eth.accounts[0]
      }).then(() => {
        contractInstance.trustedOracle().then(data => {
          // todo display
          console.log('ORACLE', data)
        })
      })
    })
  }
}
