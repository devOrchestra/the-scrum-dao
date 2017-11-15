import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WalletStateService } from '../wallet-state.service';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Injectable()
export class WalletStateResolverService {
  Project = contract(project_artifacts);
  decimals: number;

  constructor(
    private _walletStateService: WalletStateService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    let lastBalance;
    if (JSON.parse(sessionStorage.getItem("lastBalance"))) {
      lastBalance = JSON.parse(sessionStorage.getItem("lastBalance")).lastBalance;
    }
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstance => {
        contractInstance.decimals()
          .then(decimalsResponse => {
            this.decimals = this.countDecimals(decimalsResponse);
            return contractInstance.balanceOf(web3.eth.accounts[0]);
          })
          .then(balanceOfResponse => {
            /**
             * Watcher doesn't work
             */
            console.log("1");
            const events = contractInstance.allEvents({});
            events.watch((error, result) => {
              console.log("33333333");
              if (!error) {
                console.log("result", result);
              }
            });
            console.log("2");

            const currentBalance = this.parseBigNumber(balanceOfResponse) / this.decimals;
            console.log("balanceOfResponse", currentBalance);
            // sessionStorage.setItem("lastBalance", JSON.stringify({lastBalance: 13.5}));
            if (!lastBalance || lastBalance !== currentBalance) {
              const balanceDifference = currentBalance - lastBalance;
              if (balanceDifference && !Number.isNaN(balanceDifference) && balanceDifference !== 0) {
                sessionStorage.setItem("lastBalance", JSON.stringify({lastBalance: currentBalance}));
                this._walletStateService.setLastAndCurrentBalances({
                  currentBalance: currentBalance,
                  lastBalanceFromStorage: lastBalance
                });
              }
            }
          })
      })
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
