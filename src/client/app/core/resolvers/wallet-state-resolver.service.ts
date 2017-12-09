import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { WalletStateService } from '../wallet-state.service';
import { ProjectService } from '../contract-calls/project.service';
import { parseBigNumber, countDecimals } from '../../shared/methods'

@Injectable()
export class WalletStateResolverService {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  decimals: number;

  constructor(
    private _walletStateService: WalletStateService,
    private _projectService: ProjectService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    this._projectService.initWatchingEvents()
      .then(instance => {
        const event = instance.Transfer({});
        event.watch((error, eventData) => {
          if (!error && !this.wasTransactionShown(eventData)) {
            let lastBalance;
            let lastAccount;
            const parsed = JSON.parse(localStorage.getItem("lastBalance"));
            if (parsed) {
              lastBalance = parsed.lastBalance;
              lastAccount = parsed.lastAccount;
            }
            this._projectService.decimals()
              .then(decimalsResponse => {
                this.decimals = this.countDecimals(decimalsResponse);
                return this._projectService.balanceOf(web3.eth.accounts[0]);
              })
              .then(balanceOfResponse => {
                const currentBalance = this.parseBigNumber(balanceOfResponse) / this.decimals;
                localStorage.setItem("lastBalance", JSON.stringify({lastBalance: currentBalance, lastAccount: web3.eth.accounts[0]}));
                if (lastAccount && lastAccount === web3.eth.accounts[0] && lastBalance !== null && lastBalance !== undefined) {
                  const balanceDifference = currentBalance - lastBalance;
                  if (balanceDifference && !Number.isNaN(balanceDifference) && balanceDifference !== 0) {
                    this._walletStateService.setLastAndCurrentBalances({
                      currentBalance: currentBalance,
                      lastBalanceFromStorage: lastBalance,
                      accountWasNotChanged: lastAccount === web3.eth.accounts[0]
                    });
                  }
                }
              })
              .catch(err => {
                console.error('An error occurred on wallet-state-resolver.service:', err);
              });
          }
        });
      });
  }

  wasTransactionShown(eventData): boolean {
    const parsed = JSON.parse(localStorage.getItem("lastShownTransactionHash"));
    return parsed && parsed === eventData.transactionHash;
  }
}
