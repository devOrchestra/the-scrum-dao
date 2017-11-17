import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { MdMenuTrigger } from '@angular/material'
import { WorkerService } from '../../../core/worker.service'
import { WalletStateService } from '../../../core/wallet-state.service'
import project_artifacts from '../../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import { parseBigNumber, countDecimals } from '../../../shared/methods'
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

  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  currentBalance: { [key: string]: number } = { balance: null };
  tokenSymbol: string;
  readyToDisplay = false;
  sendTokensObj: { [key: string]: string | number } = {};
  workersAddresses: string[] = [];
  walletTokensAmountChange: number;
  decimals: number;
  showNegativeBalanceChange = false;
  showPositiveBalanceChange = false;
  showAccountChange = false;
  sendTokensLoading = false;

  constructor(
    private _workerService: WorkerService,
    private _walletStateService: WalletStateService
  ) { }

  ngOnInit() {
    let addressesWereSet = false;
    this._workerService.getWorkers().subscribe(workers => {
      if (!addressesWereSet && workers) {
        let contractInstance;
        this.workersAddresses = workers.map(worker => worker[0]);
        addressesWereSet = true;
        this.Project.setProvider(web3.currentProvider);
        this.Project.deployed()
          .then(contractInstanceResponse => {
            contractInstance = contractInstanceResponse;
            return contractInstance.balanceOf(web3.eth.accounts[0])
          })
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
                if (currentBalances.accountWasNotChanged) {
                  this.currentBalance.balance = currentBalances.lastBalanceFromStorage;
                } else {
                  this.currentBalance.balance = this.currentBalance.balance / this.decimals;
                }
                this.readyToDisplay = true;
                this.showBalanceChange(currentBalances.currentBalance,
                  balanceDifference,
                  false,
                  balanceDifference > 0,
                  currentBalances.accountWasNotChanged);
              } else {
                this.currentBalance.balance = this.currentBalance.balance / this.decimals;
                this.readyToDisplay = true;
              }
            })
          })
          .catch(err => {
            console.error('An error occurred on wallet.component in "OnInit" block:', err);
          });
      }
    });
  }

  sendTokens(): void {
    if (this.sendTokensObj.address && this.sendTokensObj.value && this.sendTokensObj.value > 0) {
      let contractInstance;
      this.sendTokensLoading = true;
      this.sendTokensObj.fadeAnimation = "void";
      this.Project.deployed()
        .then(contractInstanceResponse => {
          contractInstance = contractInstanceResponse;
          return contractInstance.transfer(this.sendTokensObj.address, Number(this.sendTokensObj.value) * this.decimals, {
            gas: 500000,
            from: web3.eth.accounts[0]
          });
        })
        .then(transferResponse => {
          return contractInstance.balanceOf(web3.eth.accounts[0]);
        })
        .then(balanceResponse => {
          const balanceDifference = Number(this.sendTokensObj.value);
          this.walletTokensAmountChange = balanceDifference;
          const newBalance = this.currentBalance.balance - balanceDifference;
          this.showBalanceChange(newBalance, balanceDifference, true, false, true);
        })
        .catch(err => {
          console.error('An error occurred on wallet.component in "sendTokens":', err);
          this.sendTokensLoading = false;
        });
    }
  }

  showBalanceChange(newBalance: number, balanceDifference: number, isAfterSend: boolean, positive: boolean, accountWasNotSwitched: boolean): void {
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
    if (!accountWasNotSwitched) {
      setTimeout(() => {
        this.showAccountChange = true;
      }, 1000);
      setTimeout(() => {
        this.showAccountChange = false;
      }, 6000);
    } else if (positive && accountWasNotSwitched) {
      setTimeout(() => {
        this.showPositiveBalanceChange = true;
      }, 1000);
      setTimeout(() => {
        this.animateMyWalletCounter(newBalance);
      }, 2000);
      setTimeout(() => {
        this.showPositiveBalanceChange = false;
      }, 10000);
    } else if (!positive && accountWasNotSwitched) {
      setTimeout(() => {
        this.showNegativeBalanceChange = true;
      }, 1000);
      setTimeout(() => {
        this.animateMyWalletCounter(newBalance);
      }, 2000);
      setTimeout(() => {
        this.showNegativeBalanceChange = false;
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
}
