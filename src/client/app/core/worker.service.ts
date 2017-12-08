import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IHolder } from "../shared/interfaces";

@Injectable()
export class WorkerService {
  private totalBalance: number;

  constructor(
    private http: Http
  ) { }

  public setTotalBalance(balance: number): void {
    this.totalBalance = balance;
  }

  public getTotalBalance(): number {
    return this.totalBalance;
  }

  public getContributors(): Promise<any> {
    return this.http.get(`/api/contributors`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (WorkerService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
