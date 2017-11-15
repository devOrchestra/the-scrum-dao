import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { MdMenuTrigger } from '@angular/material'
import { WorkerService } from '../../../core/worker.service'
import { WalletStateService } from '../../../core/wallet-state.service'
import project_artifacts from '../../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import {MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation} from '../../../shared/animations'
import anime from 'animejs'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  animations: [MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation]
})
export class WalletComponent implements OnInit {
  @ViewChild('sendTokensMenuTrigger') sendTokensMenuTrigger: MdMenuTrigger;
  Project = contract(project_artifacts);
  currentBalance: { [key: string]: number } = { balance: null };
  tokenSymbol: string;
  readyToDisplay = false;
  sendTokensObj: { [key: string]: string | number } = {};
  workersAddresses: string[] = [];
  walletTokensAmountChange: number;
  decimals: number;
  showNegativeBalanceChange = false;
  showPositiveBalanceChange = false;
  sendTokensLoading = false;

  constructor(
    private _workerService: WorkerService,
    private _walletStateService: WalletStateService
  ) { }

  ngOnInit() {
    let addressesWereSet = false;
    this._workerService.getWorkers().subscribe(workers => {
      if (!addressesWereSet && workers) {
        this.workersAddresses = workers.map(worker => worker[0]);
        addressesWereSet = true;
        this.Project.setProvider(web3.currentProvider);
        this.Project.deployed()
          .then(contractInstance => {
            contractInstance.balanceOf(web3.eth.accounts[0])
              .then(balanceResponse => {
                this.currentBalance.balance = this.parseBigNumber(balanceResponse);
                return contractInstance.symbol();
              })
              .then(symbol => {
                this.tokenSymbol = symbol;
                return contractInstance.decimals();
              })
              .then(decimalsResponse => {
                this.decimals = this.countDecimals(decimalsResponse);
                this._walletStateService.getLastAndCurrentBalances().subscribe(currentBalances => {
                  const balanceDifference = currentBalances.currentBalance - currentBalances.lastBalanceFromStorage;
                  if (balanceDifference && balanceDifference !== 0) {
                    this.readyToDisplay = true;
                    this.currentBalance.balance = currentBalances.lastBalanceFromStorage;
                    if (balanceDifference > 0) {
                      this.showBalanceChange(currentBalances.currentBalance, balanceDifference, false, true);
                    } else if (balanceDifference < 0) {
                      this.showBalanceChange(currentBalances.currentBalance, balanceDifference, false, false);
                    }
                  } else {
                    this.currentBalance.balance = this.currentBalance.balance / this.decimals;
                    this.readyToDisplay = true;
                  }
                })
              })
          })
      }
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
              const balanceDifference = Number(this.sendTokensObj.value);
              this.walletTokensAmountChange = balanceDifference;
              const newBalance = this.currentBalance.balance - balanceDifference;
              this.showBalanceChange(newBalance, balanceDifference, true, false);
            })
            .catch((err) => {
              console.log("ERR", err);
              this.sendTokensLoading = false;
            })
        })
    }
  }

  showBalanceChange(newBalance: number, balanceDifference: number, isAfterSend: boolean, positive: boolean): void {
    this.walletTokensAmountChange = balanceDifference < 0 ? balanceDifference * -1 : balanceDifference;
    if (isAfterSend) {
      this.sendTokensObj.address = "";
      this.sendTokensObj.value = "";
      this.sendTokensMenuTrigger.closeMenu();
      this.sendTokensLoading = false;
    }
    this.sendTokensObj.fadeAnimation = "animate";
    setTimeout(() => {
      this.sendTokensObj.fadeAnimation = "";
    }, 500);
    if (positive) {
      setTimeout(() => {
        this.showPositiveBalanceChange = true;
      }, 1000);
      setTimeout(() => {
        this.animateMyWalletCounter(newBalance);
      }, 2000);
      setTimeout(() => {
        this.showPositiveBalanceChange = false;
      }, 10000);
    } else if (!positive) {
      setTimeout(() => {
        this.showNegativeBalanceChange = true;
      }, 1000);
      setTimeout(() => {
        this.animateMyWalletCounter(newBalance);
      }, 2000);
      setTimeout(() => {
        this.showNegativeBalanceChange = false;
        console.log('current balance:', this.currentBalance.balance);
      }, 10000);
      sessionStorage.setItem("lastBalance", JSON.stringify({lastBalance: newBalance}));
    }
  }

  animateMyWalletCounter(toValue: number): void {
    anime({
      targets: this.currentBalance,
      balance: toValue,
      easing: 'easeInOutExpo',
      duration: 3000
    });
  };

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
