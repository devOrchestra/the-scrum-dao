import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { IHolder } from "../shared/interfaces";

@Injectable()
export class WorkerService {
  public workers: (string | number)[];
  public workers$: BehaviorSubject<(string | number)[]> = new BehaviorSubject<(string | number)[]>(null);
  public holders: IHolder[];
  public holders$: BehaviorSubject<IHolder[]> = new BehaviorSubject<IHolder[]>(null);
  private totalBalance: number;

  public workersAvatarsWereSet = false;

  constructor(
    private http: Http
  ) { }

  public setWorkers(workers: (string | number)[]): void {
    this.workers = workers;
    this.workers$.next(workers);
  }

  public getWorkers(): Observable<(string | number)[]> {
    return this.workers$.asObservable();
  }

  public setHolders(holders: IHolder[]): void {
    this.holders = holders;
    this.holders$.next(holders);
  }

  public getHolders(): Observable<IHolder[]> {
    return this.holders$.asObservable();
  }

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
