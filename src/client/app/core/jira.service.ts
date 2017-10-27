import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject, Observable } from "rxjs";
import 'rxjs/add/operator/toPromise';

@Injectable()
export class JiraService {
  public issues;
  public issues$: BehaviorSubject<any> = new BehaviorSubject<any>('');

  constructor(
    private http: Http
  ) { }

  setIssues(issues: string): void {
    this.issues = issues;
    this.issues$.next(issues);
  }

  getIssues(): Observable<string> {
    return this.issues$.asObservable();
  }

  getIssueListFromApi() {
    return this.http.get(`/api/issues`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  private sendResponse(response: any): Promise<any> {
    return Promise.resolve(JSON.parse(response._body));
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred (JiraService): ', error);
    return Promise.reject(error.message || error._body || error);
  }
}
