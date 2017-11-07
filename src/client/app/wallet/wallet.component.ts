import { Component, OnInit } from '@angular/core';
import { WorkerService } from '../core/worker.service'
import project_artifacts from '../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import {MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation} from '../shared/animations'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  animations: [MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation]
})
export class WalletComponent implements OnInit {
  Project = contract(project_artifacts);
  currentBalance: number;
  tokenSymbol: string;
  readyToDisplay = false;
  sendTokensObj: { [key: string]: string | number } = {};
  workersAddresses: string[] = [];
  isSendTokensRecipientExists = false;
  sentTokens;
  decimals: number;
  showSentTokens = false;
  sendTokensLoading = false;

  constructor(
    private _workerService: WorkerService
  ) { }

  ngOnInit() {
    this._workerService.getWorkers().subscribe(workers => {
      this.workersAddresses = workers.map(worker => worker[0]);
      this.Project.setProvider(web3.currentProvider);
      this.Project.deployed()
        .then(contractInstance => {
          contractInstance.balanceOf(web3.eth.accounts[0])
            .then(balanceResponse => {
              this.currentBalance = this.parseBigNumber(balanceResponse);
              return contractInstance.symbol();
            })
            .then(symbol => {
              this.tokenSymbol = symbol;
              return contractInstance.decimals();
            })
            .then(decimalsResponse => {
              this.decimals = this.countDecimals(decimalsResponse);
              this.currentBalance = this.currentBalance / this.decimals;
              this.readyToDisplay = true;
            })
        })
    });
  }

  sendTokens(): void {
    if (this.sendTokensObj.address && this.sendTokensObj.value && this.sendTokensObj.value > 0) {
      this.sendTokensLoading = true;
      this.sendTokensObj.fadeAnimation = "void";
      this.Project.deployed()
        .then(contractInstance => {
          contractInstance.transfer(this.sendTokensObj.address, Number(this.sendTokensObj.value) * this.decimals, {gas: 500000, from: web3.eth.accounts[0]})
            .then(transferResponse => {
              return contractInstance.balanceOf(web3.eth.accounts[0]);
            })
            .then(balanceResponse => {
              this.sentTokens = this.sendTokensObj.value;
              this.currentBalance = this.currentBalance - Number(this.sendTokensObj.value);
              this.sendTokensObj.address = "";
              this.sendTokensObj.value = "";
              this.sendTokensLoading = false;
              this.sendTokensObj.fadeAnimation = "animate";
              setTimeout(() => {
                this.sendTokensObj.fadeAnimation = "";
              }, 500);
              setTimeout(() => {
                this.showSentTokens = true;
              }, 1000);
              setTimeout(() => {
                this.showSentTokens = false;
              }, 6000);
            })
            .catch(() => {
              this.sendTokensLoading = false;
            })
        })
    }
  }

  checkIsRecipientExists(): void {
    let flag = true;
    this.workersAddresses.forEach(item => {
      if (flag && item === this.sendTokensObj.address) {
        this.isSendTokensRecipientExists = true;
        flag = false
      } else if (flag && this.isSendTokensRecipientExists && item !== this.sendTokensObj.address) {
        this.isSendTokensRecipientExists = false;
      }
    });
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
