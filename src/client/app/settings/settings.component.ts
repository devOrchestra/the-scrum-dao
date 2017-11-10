import {Component, OnInit} from '@angular/core';
import {WorkerService} from '../core/worker.service'
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import {ShortEnterAnimation, FlashAnimation, AlternativeControlFlashAnimation, ControlledFadeOutHighlightAnimation} from '../shared/animations'

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
  animations: [ShortEnterAnimation, FlashAnimation, AlternativeControlFlashAnimation, ControlledFadeOutHighlightAnimation]
})
export class SettingsComponent implements OnInit {
  worker: any = {};
  workers: any[] = [];
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
  Project = contract(project_artifacts);

  constructor(
    private _workerService: WorkerService
  ) {}

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstance => {
        contractInstance.trustedOracle()
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
                console.log("WORKERS:", getWorkersResponse);
                this.workers = this.formatWorkers(getWorkersResponse);
                this.readyToDisplay = true;
              }
          })
      })
    });
  }

  addWorker(address) {
    const ethAddressAlreadyExists = this.checkIsWorkersEthAddressAlreadyExists(address);
    if (!ethAddressAlreadyExists) {
      this.addWorkerLoading = true;
      console.log('this.worker.address', this.worker.address, 'this.worker.login', this.worker.login);
      this.Project.deployed()
        .then(contractInstance => {
          contractInstance.addWorker(this.worker.address, this.worker.login, {
            from: web3.eth.accounts[0],
            gas: 150000
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
              this.worker.flashAnimation = "animate";
              this.workers.push(worker);
              this.worker = {};
              this.addWorkerLoading = false;
            })
            .catch(() => {
              this.addWorkerLoading = false;
            })
        })
        .catch(() => {
          this.addWorkerLoading = false;
        })
    } else {
      this.showWorkerWithSuchEthAddressExists = true;
      setTimeout(() => {
        this.worker = {};
        this.showWorkerWithSuchEthAddressExists = false;
      }, 5000);
    }
  }


  addOracleAddress() {
    const specifiedOracleAlreadyExists = this.currentOracleAddress === this.newOracleAddress;
    if (!specifiedOracleAlreadyExists) {
      this.addOracleLoading = true;
      this.Project.deployed()
        .then(contractInstance => {
          contractInstance.addTrustedOracle(this.newOracleAddress, {
            from: web3.eth.accounts[0],
            gas: 150000
          })
            .then(() => {
              return contractInstance.trustedOracle()
            })
            .then(newOracle => {
              console.log('new oracle:', newOracle);
              this.oracleFlashAnimation = "animate";
              this.currentOracleAddress = newOracle;
              this.newOracleAddress = "";
              this.addOracleLoading = false;
              setTimeout(() => {
                this.oracleFlashAnimation = "";
              }, 1000);
            })
            .catch(() => {
              this.addOracleLoading = false;
            })
        })
        .catch(() => {
          this.addOracleLoading = false;
        })
    } else {
      this.showOracleExists = true;
      setTimeout(() => {
        this.newOracleAddress = "";
        this.showOracleExists = false;
      }, 5000);
    }
  }

  addCrowdsale() {
    const specifiedCrowdsaleAlreadyExists = this.currentCrowdsale === this.newCrowdsale;
    if (!specifiedCrowdsaleAlreadyExists) {
      this.addCrowdsaleLoading = true;
      this.Project.deployed()
        .then(contractInstance => {
          contractInstance.initCrowdsale(this.newCrowdsale, {
            from: web3.eth.accounts[0],
            gas: 150000
          })
            .then(() => {
              return contractInstance.crowdsale();
            })
            .then(newCrowdsale => {
              console.log('new crowdsale:', newCrowdsale);
              this.crowdsaleFlashAnimation = "animate";
              this.currentCrowdsale = newCrowdsale;
              this.newCrowdsale = "";
              this.addCrowdsaleLoading = false;
              setTimeout(() => {
                this.crowdsaleFlashAnimation = "";
              }, 1000);
            })
            .catch(() => {
              this.addCrowdsaleLoading = false;
            })
        })
        .catch(() => {
          this.addCrowdsaleLoading = false;
        })
    } else {
      this.showCrowdsaleExists = true;
      setTimeout(() => {
        this.newCrowdsale = "";
        this.showCrowdsaleExists = false;
      }, 5000);
    }
  }

  formatWorkers(arr: [string | number]): { [key: string]: string | number }[] {
    const newArr = [];
    arr.forEach(item => {
      newArr.push({
        address: item[0],
        username: item[1],
        balance: item[2]
      })
    });
    return newArr;
  }

  checkIsWorkersEthAddressAlreadyExists(currentAddress): boolean {
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
