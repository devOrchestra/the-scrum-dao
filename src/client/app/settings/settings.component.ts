import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {WorkerService} from '../core/worker.service'
import {ProjectService} from '../core/contract-calls/project.service'
import {countDecimals, parseBigNumber} from '../shared/methods'
import { ISettingsWorker, IContributor } from "../shared/interfaces";
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
  countDecimals = countDecimals;
  parseBigNumber = parseBigNumber;

  worker: { [key: string]: string } = {};
  workers: ISettingsWorker[] = [];
  currentOracleAddress: string;
  oracleBalance: number;
  newCrowdsale: string;
  currentCrowdsale: string;
  symbol: string;
  decimals: number;
  readyToDisplay = false;
  addWorkerLoading = false;
  addCrowdsaleLoading = false;
  oracleFlashAnimation = "void";
  crowdsaleFlashAnimation = "void";
  showWorkerWithSuchEthAddressExists = false;
  showCrowdsaleExists = false;

  /* Helpers */
  public workersFinal = [];

  constructor(
    private _titleService: Title,
    private _projectService: ProjectService
  ) {
    const currentTitle = this._titleService.getTitle(),
          neededTitle = 'Scrum DAO - Settings';
    if (currentTitle !== neededTitle) {
      this._titleService.setTitle(neededTitle);
    }
  }

  ngOnInit() {
    this._projectService.trustedOracle()
      .then(trustedOracleResponse => {
        this.currentOracleAddress = trustedOracleResponse;
        return this._projectService.crowdsale();
      })
      .then(crowdsaleResponse => {
        this.currentCrowdsale = crowdsaleResponse;
        return this._projectService.symbol();
      })
      .then(symbolResponse => {
        this.symbol = symbolResponse;
        return this._projectService.decimals();
      })
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        return this.getWorkers();
      })
      .then(getWorkersResponse => {
        this.workers = this.formatWorkers(getWorkersResponse);
        web3.eth.getBalance(this.currentOracleAddress, (err, data) => {
          if (err) {
            console.error(err);
          } else if (data) {
            this.oracleBalance =  Number(web3.fromWei(this.parseBigNumber(data), "gwei"));
            this.readyToDisplay = true;
          }
        });
      })
      .catch(err => {
        console.error('An error occurred on settings.component in "OnInit" block:', err);
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
        return this.workersFinal;
      })
  }

  addWorker(address: string): void {
    const ethAddressAlreadyExists = this.checkIsWorkersEthAddressAlreadyExists(address);
    let workerWasAdded = false;
    if (!ethAddressAlreadyExists) {
      this.addWorkerLoading = true;
      this._projectService.addWorker(this.worker.address, this.worker.login)
        .then(() => {
          workerWasAdded = true;
          return this._projectService.getWorkersLength();
        })
        .then(data => {
          const length = parseInt(data.toString(), 10);
          return this._projectService.getWorker(length);
        })
        .then(worker => {
          worker = this.formatWorkers([worker]);
          worker[0].flashAnimation = "animate";
          this.workers.push(worker[0]);
          this.worker = {};
          this.addWorkerLoading = false;
        })
        .catch(err => {
          if (err.toString().includes("new BigNumber() not a base 16 number") && workerWasAdded) {
            this._projectService.getWorkersLength()
              .then(data => {
                const length = parseInt(data.toString(), 10);
                return this._projectService.getWorker(length);
              })
              .then(worker => {
                worker = this.formatWorkers([worker]);
                worker[0].flashAnimation = "animate";
                this.workers.push(worker[0]);
                this.worker = {};
                this.addWorkerLoading = false;
              })
          } else {
            console.error('An error occurred on settings.component in "addWorker":', err);
            this.addWorkerLoading = false;
          }
        });
    } else {
      this.showWorkerWithSuchEthAddressExists = true;
      setTimeout(() => {
        this.worker = {};
        this.showWorkerWithSuchEthAddressExists = false;
      }, 5000);
    }
  }

  addCrowdsale(): void {
    const specifiedCrowdsaleAlreadyExists = this.currentCrowdsale === this.newCrowdsale;
    if (!specifiedCrowdsaleAlreadyExists) {
      this.addCrowdsaleLoading = true;
      this._projectService.initCrowdsale(this.newCrowdsale)
        .then(() => {
          return this._projectService.crowdsale();
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
