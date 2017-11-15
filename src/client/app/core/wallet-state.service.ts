import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class WalletStateService {
  public lastAndCurrentBalances: {[key: string]: number} = null;
  public lastAndCurrentBalances$: BehaviorSubject<{[key: string]: number}> = new BehaviorSubject<{[key: string]: number}>({});

  constructor() { }

  setLastAndCurrentBalances(balances: {[key: string]: number}): void {
    this.lastAndCurrentBalances = balances;
    this.lastAndCurrentBalances$.next(balances);
  }

  getLastAndCurrentBalances(): Observable<{[key: string]: number}> {
    return this.lastAndCurrentBalances$.asObservable();
  }
}
