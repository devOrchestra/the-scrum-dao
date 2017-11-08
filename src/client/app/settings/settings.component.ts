import {Component, OnInit} from '@angular/core';
import {WorkerService} from '../core/worker.service'
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import {ShortEnterAnimation} from '../shared/animations'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [ShortEnterAnimation]
})
export class SettingsComponent implements OnInit {
  worker: any = {};
  workers: any[] = [];
  newOracleAddress: string;
  currentOracleAddress: string;
  newCrowdsale: string;
  readyToDisplay = false;
  Project = contract(project_artifacts);

  constructor(
    private _workerService: WorkerService
  ) {}

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed().then(contractInstance => {
      contractInstance.trustedOracle().then(data => {
        this.currentOracleAddress = data;
        this._workerService.getWorkers().subscribe(getWorkersResponse => {
          console.log("WORKERS:", getWorkersResponse);
          this.workers = getWorkersResponse;
          this.readyToDisplay = true;
        })
      })
    });
  }

  addWorker() {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addWorker(this.worker.address, this.worker.login, {
        from: web3.eth.accounts[0],
        gas: 150000
      })
      .then(() => {
        contractInstance.getWorkersLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getWorker.call(length).then(worker => {
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
          this.currentOracleAddress = data;
        })
      })
    })
  }

  addCrowdsale() {
    console.log('newCrowdsale:', this.newCrowdsale);
  }
}
