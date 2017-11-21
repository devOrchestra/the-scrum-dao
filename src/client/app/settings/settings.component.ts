import {Component, OnInit} from '@angular/core';
import {WorkerService} from '../core/worker.service'
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import {countDecimals, gas} from '../shared/methods'
import { ISettingsWorker } from "../shared/interfaces";
import {
  ShortEnterAnimation,
  FlashAnimation,
  AlternativeControlFlashAnimation,
  ControlledFadeOutHighlightAnimation,
  ControlFlashAnimation
} from '../shared/animations'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [
    ShortEnterAnimation,
    FlashAnimation,
    AlternativeControlFlashAnimation,
    ControlledFadeOutHighlightAnimation,
    ControlFlashAnimation
  ]
})
export class SettingsComponent implements OnInit {
  Project = contract(project_artifacts);

  countDecimals = countDecimals;
  gas = gas;

  worker: { [key: string]: string } = {};
  workers: ISettingsWorker[] = [];
  newOracleAddress: string;
  currentOracleAddress: string;
  newCrowdsale: string;
  currentCrowdsale: string;
  symbol: string;
  decimals: number;
  readyToDisplay = false;
  addWorkerLoading = false;
  addOracleLoading = false;
  addCrowdsaleLoading = false;
  oracleFlashAnimation = "void";
  crowdsaleFlashAnimation = "void";
  showWorkerWithSuchEthAddressExists = false;
  showOracleExists = false;
  showCrowdsaleExists = false;

  constructor(
    private _workerService: WorkerService
  ) { }

  ngOnInit() {
    let contractInstance;
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstanceResponse => {
        contractInstance = contractInstanceResponse;
        return contractInstance.trustedOracle()
      })
      .then(trustedOracleResponse => {
        this.currentOracleAddress = trustedOracleResponse;
        return contractInstance.crowdsale();
      })
      .then(crowdsaleResponse => {
        this.currentCrowdsale = crowdsaleResponse;
        return contractInstance.symbol();
      })
      .then(symbolResponse => {
        this.symbol = symbolResponse;
        return contractInstance.decimals();
      })
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        this._workerService.getWorkers().subscribe(getWorkersResponse => {
          if (getWorkersResponse) {
            this.workers = this.formatWorkers(getWorkersResponse);
            this.readyToDisplay = true;
          }
        })
      })
      .catch(err => {
        console.error('An error occurred on settings.component in "OnInit" block:', err);
      });
  }

  addWorker(address: string): void {
    const ethAddressAlreadyExists = this.checkIsWorkersEthAddressAlreadyExists(address);
    if (!ethAddressAlreadyExists) {
      let contractInstance;
      this.addWorkerLoading = true;
      this.Project.deployed()
        .then(contractInstanceResponse => {
          contractInstance = contractInstanceResponse;
          return contractInstance.addWorker(this.worker.address, this.worker.login, {
            from: web3.eth.accounts[0]
          });
        })
        .then(() => {
          return contractInstance.getWorkersLength.call();
        })
        .then(data => {
          const length = parseInt(data.toString(), 10);
          return contractInstance.getWorker.call(length);
        })
        .then(worker => {
          worker = this.formatWorkers([worker]);
          worker[0].flashAnimation = "animate";
          this.workers.push(worker[0]);
          this.worker = {};
          this.addWorkerLoading = false;
        })
        .catch(err => {
          console.error('An error occurred on settings.component in "addWorker":', err);
          this.addWorkerLoading = false;
        });
    } else {
      this.showWorkerWithSuchEthAddressExists = true;
      setTimeout(() => {
        this.worker = {};
        this.showWorkerWithSuchEthAddressExists = false;
      }, 5000);
    }
  }


  addOracleAddress(): void {
    const specifiedOracleAlreadyExists = this.currentOracleAddress === this.newOracleAddress;
    if (!specifiedOracleAlreadyExists) {
      let contractInstance;
      this.addOracleLoading = true;
      this.Project.deployed()
        .then(contractInstanceResponse => {
          contractInstance = contractInstanceResponse;
          return contractInstance.addTrustedOracle(this.newOracleAddress, {
            from: web3.eth.accounts[0],
            gas: this.gas
          });
        })
        .then(() => {
          return contractInstance.trustedOracle();
        })
        .then(newOracle => {
          this.oracleFlashAnimation = "animate";
          this.currentOracleAddress = newOracle;
          this.newOracleAddress = "";
          this.addOracleLoading = false;
          setTimeout(() => {
            this.oracleFlashAnimation = "";
          }, 1000);
        })
        .catch(err => {
          console.error('An error occurred on settings.component in "addOracleAddress":', err);
          this.addOracleLoading = false;
        });
    } else {
      this.showOracleExists = true;
      setTimeout(() => {
        this.newOracleAddress = "";
        this.showOracleExists = false;
      }, 5000);
    }
  }

  addCrowdsale(): void {
    const specifiedCrowdsaleAlreadyExists = this.currentCrowdsale === this.newCrowdsale;
    if (!specifiedCrowdsaleAlreadyExists) {
      let contractInstance;
      this.addCrowdsaleLoading = true;
      this.Project.deployed()
        .then(contractInstanceResponse => {
          contractInstance = contractInstanceResponse;
          return contractInstance.initCrowdsale(this.newCrowdsale, {
            from: web3.eth.accounts[0],
            gas: this.gas
          });
        })
        .then(() => {
          return contractInstance.crowdsale();
        })
        .then(newCrowdsale => {
          this.crowdsaleFlashAnimation = "animate";
          this.currentCrowdsale = newCrowdsale;
          this.newCrowdsale = "";
          this.addCrowdsaleLoading = false;
          setTimeout(() => {
            this.crowdsaleFlashAnimation = "";
          }, 1000);
        })
        .catch(err => {
          console.error('An error occurred on settings.component in "addOracleAddress":', err);
          this.addCrowdsaleLoading = false;
        });
    } else {
      this.showCrowdsaleExists = true;
      setTimeout(() => {
        this.newCrowdsale = "";
        this.showCrowdsaleExists = false;
      }, 5000);
    }
  }

  formatWorkers(arr: (string | number)[]): ISettingsWorker[] {
    const newArr = [];
    arr.forEach(item => {
      newArr.push({
        address: item[0],
        username: item[1],
        balance: item[2] || 0
      })
    });
    return newArr;
  }

  checkIsWorkersEthAddressAlreadyExists(currentAddress: string): boolean {
    let exists = false;
    if (this.workers.length && this.workers.length > 0) {
      this.workers.forEach(item => {
        if (item.address === currentAddress) {
          exists = true;
          item.highlightAnimation = "animate";
          setTimeout(() => {
            item.highlightAnimation = "";
          }, 4000);
        }
      });
      return exists;
    } else {
      return false;
    }
  }
}
