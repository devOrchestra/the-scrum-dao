import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject, Observable } from "rxjs";
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class UserService {
  public currentUsername: string = null;
  public currentUsername$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  constructor(
    private http: Http
  ) {
    console.log('UserService works');
  }

  setCurrentUsername(username: string): void {
    this.currentUsername = username;
    this.currentUsername$.next(username);
  }

  getCurrentUsername(): Observable<string> {
    return this.currentUsername$.asObservable();
  }

  getUser(userRequestData?): Promise<any> {
    console.log('"getUser" in "UserService" starts working');
    return this.http.get(`/api/getUser`, userRequestData)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (AuthService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
