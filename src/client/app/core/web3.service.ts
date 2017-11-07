import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";

@Injectable()
export class Web3Service {
  public connectionState: string = null;
  public connectionState$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor() { }

  setConnectionState(state: string): void {
    this.connectionState = state;
    this.connectionState$.next(state);
  }

  getConnectionState(): Observable<string> {
    return this.connectionState$.asObservable();
  }
}
