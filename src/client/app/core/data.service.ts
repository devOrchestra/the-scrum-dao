import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from "rxjs";
import { IRegisterUser } from '../shared/interfaces';

@Injectable()
export class DataService {
  public signUpData: IRegisterUser;
  public signUpData$: BehaviorSubject<any> = new BehaviorSubject<any>(''); // ???

  constructor() {
    console.log('DataService works');
  }

  public setSignUpData(signUpData: IRegisterUser): void {
    this.signUpData = signUpData;
    this.signUpData$.next(signUpData);
  }

  public getSignUpData(): Observable<IRegisterUser> {
    return this.signUpData$.asObservable();
  }
}
