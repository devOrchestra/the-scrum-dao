import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { MdMenuTrigger } from '@angular/material'
import { ProjectService } from '../../../core/contract-calls/project.service'
import { Web3Service } from '../../../core/web3.service'
import { WalletStateService } from '../../../core/wallet-state.service'
import { parseBigNumber, countDecimals } from '../../../shared/methods'
import { MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation } from '../../../shared/animations'
import anime from 'animejs'

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css'],
  animations: [MediumEnterLeaveAnimation, MediumControlledEnterLeaveAnimation]
})
export class WalletComponent implements OnInit {
  @ViewChild('sendTokensMenuTrigger') sendTokensMenuTrigger: MdMenuTrigger;

  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  currentBalance: { [key: string]: number } = { balance: null };
  tokenSymbol: string;
  readyToDisplay = false;
  sendTokensObj: { address: string, value: string, fadeAnimation: string } = {address: "", value: "", fadeAnimation: ""};
  walletTokensAmountChange: number;
  decimals: number;
  showNegativeBalanceChange = false;
  showPositiveBalanceChange = false;
  showAccountChange = false;
  sendTokensLoading = false;
  accountChangeWasShown = false;

  constructor(
    private _walletStateService: WalletStateService,
    private _projectService: ProjectService,
    private _web3Service: Web3Service
  ) { }

  ngOnInit() {
    this._projectService.balanceOf(web3.eth.accounts[0])
      .then(balanceResponse => {
        this.currentBalance.balance = this.parseBigNumber(balanceResponse);
        return this._projectService.symbol();
      })
      .then(symbol => {
        this.tokenSymbol = symbol;
        return this._projectService.decimals();
      })
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        this._walletStateService.getLastAndCurrentBalances().subscribe(currentBalances => {
          this._web3Service.getNeedToShowAccountChange().subscribe(needToShowAccountChange => {
            const balanceDifference = currentBalances.currentBalance - currentBalances.lastBalanceFromStorage;
            if (balanceDifference && balanceDifference !== 0) {
              if (currentBalances.accountWasNotChanged) {
                this.currentBalance.balance = currentBalances.lastBalanceFromStorage;
              } else {
                this.currentBalance.balance = this.currentBalance.balance / this.decimals;
              }
              this.readyToDisplay = true;
              if (needToShowAccountChange && !this.accountChangeWasShown) {
                this.accountChangeWasShown = true;
                this.displayAccountChange()
              }
              this.showBalanceChange(
                currentBalances.currentBalance,
                balanceDifference,
                false,
                balanceDifference > 0
              );
            } else {
              this.currentBalance.balance = this.currentBalance.balance / this.decimals;
              this.readyToDisplay = true;
              if (needToShowAccountChange && !this.accountChangeWasShown) {
                this.accountChangeWasShown = true;
                this.displayAccountChange()
              }
            }
          });
        })
      })
      .catch(err => {
        console.error('An error occurred on wallet.component in "OnInit" block:', err);
      });
  }

  sendTokens(): void {
    if (this.sendTokensObj.address && this.sendTokensObj.value && Number(this.sendTokensObj.value) > 0) {
      this.sendTokensLoading = true;
      this.sendTokensObj.fadeAnimation = "void";
      console.log("tokens to send:", Number(this.sendTokensObj.value) * this.decimals);
      this._projectService.transfer(this.sendTokensObj.address, Number(this.sendTokensObj.value) * this.decimals)
        .then(transferResponse => {
          return this._projectService.balanceOf(web3.eth.accounts[0]);
        })
        .then(balanceResponse => {
          const balanceDifference = Number(this.sendTokensObj.value);
          this.walletTokensAmountChange = balanceDifference;
          const newBalance = this.currentBalance.balance - balanceDifference;
          this.clearFormAfterTokensSend();
        })
        .catch(err => {
          console.error('An error occurred on wallet.component in "sendTokens":', err);
          this.clearFormAfterTokensSend();
        });
    }
  }

  clearFormAfterTokensSend(): void {
    this.sendTokensObj.address = "";
    this.sendTokensObj.value = "";
    this.sendTokensMenuTrigger.closeMenu();
    this.sendTokensLoading = false;
  }

  showBalanceChange(newBalance: number, balanceDifference: number, isAfterSend: boolean, positive: boolean): void {
    this.walletTokensAmountChange = balanceDifference < 0 ? balanceDifference * -1 : balanceDifference;
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
      }, 10000);
      localStorage.setItem("lastBalance", JSON.stringify({lastBalance: newBalance, lastAccount: web3.eth.accounts[0]}));
    }
  }

  displayAccountChange(): void {
    sessionStorage.setItem("lastAddress", JSON.stringify({lastAddress: web3.eth.accounts[0]}));
    setTimeout(() => {
      this.showAccountChange = true;
    }, 1000);
    setTimeout(() => {
      this.showAccountChange = false;
    }, 6000);
  }

  animateMyWalletCounter(toValue: number): void {
    anime({
      targets: this.currentBalance,
      balance: toValue,
      duration: 3000
    });
  };
}
