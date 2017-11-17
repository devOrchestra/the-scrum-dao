import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WalletStateService } from '../wallet-state.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'
import { parseBigNumber, countDecimals } from '../../shared/methods'

@Injectable()
export class WalletStateResolverService {
  Project = contract(project_artifacts);

  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  decimals: number;

  constructor(
    private _walletStateService: WalletStateService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    let lastBalance;
    let lastAccount;
    let contractInstance;
    const parsed = JSON.parse(sessionStorage.getItem("lastBalance"));
    if (parsed) {
      lastBalance = parsed.lastBalance;
      lastAccount = parsed.lastAccount;
    }
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstanceResponse => {
        contractInstance = contractInstanceResponse;
        return contractInstance.decimals()
      })
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        return contractInstance.balanceOf(web3.eth.accounts[0]);
      })
      .then(balanceOfResponse => {
        /**
         * Watcher doesn't work
         */
        const event = contractInstance.Transfer({});
        event.watch((error, result) => {
          if (!error) {
            console.log("result", result);
          }
        });

        const currentBalance = this.parseBigNumber(balanceOfResponse) / this.decimals;
        // sessionStorage.setItem("lastBalance", JSON.stringify({lastBalance: 15.5, lastAccount: web3.eth.accounts[0]}));
        const balanceDifference = currentBalance - lastBalance;
        if (balanceDifference && !Number.isNaN(balanceDifference) && balanceDifference !== 0) {
          sessionStorage.setItem("lastBalance", JSON.stringify({lastBalance: currentBalance, lastAccount: web3.eth.accounts[0]}));
          this._walletStateService.setLastAndCurrentBalances({
            currentBalance: currentBalance,
            lastBalanceFromStorage: lastBalance,
            accountWasNotChanged: lastAccount === web3.eth.accounts[0]
          });
        }
      })
      .catch(err => {
        console.error('An error occurred on wallet-state-resolver.service:', err);
      });
  }
}
