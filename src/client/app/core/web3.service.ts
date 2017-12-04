import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class Web3Service {
  public connectionState: string = null;
  public connectionState$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  public needToShowAccountChange = false;
  public needToShowAccountChange$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor() { }

  setConnectionState(state: string): void {
    this.connectionState = state;
    this.connectionState$.next(state);
  }

  getConnectionState(): Observable<string> {
    return this.connectionState$.asObservable();
  }

  setNeedToShowAccountChange(need: boolean): void {
    this.needToShowAccountChange = need;
    this.needToShowAccountChange$.next(need);
  }

  getNeedToShowAccountChange(): Observable<boolean> {
    return this.needToShowAccountChange$.asObservable();
  }
}
