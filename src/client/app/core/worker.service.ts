import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WorkerService {
  public workers;
  public workers$: BehaviorSubject<any> = new BehaviorSubject<any>('');

  public workersAvatarsWereSet = false;

  constructor(
    private http: Http
  ) {
    console.log('WorkerService works');
  }

  public setWorkers(workers): void {
    this.workers = workers;
    this.workers$.next(workers);
  }

  public getWorkers(): Observable<any> {
    return this.workers$.asObservable();
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
    console.error('An error occurred (AuthService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
