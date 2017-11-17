import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { IBalances } from '../shared/interfaces'

@Injectable()
export class WalletStateService {
  public lastAndCurrentBalances: IBalances = null;
  public lastAndCurrentBalances$: BehaviorSubject<IBalances> = new BehaviorSubject<IBalances>({
    currentBalance: null,
    lastBalanceFromStorage: null,
    accountWasNotChanged: null
});

  constructor() { }

  setLastAndCurrentBalances(balances: IBalances): void {
    this.lastAndCurrentBalances = balances;
    this.lastAndCurrentBalances$.next(balances);
  }

  getLastAndCurrentBalances(): Observable<IBalances> {
    return this.lastAndCurrentBalances$.asObservable();
  }
}
