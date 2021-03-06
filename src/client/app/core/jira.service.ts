import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class JiraService {
  constructor(
    private http: Http
  ) { }

  getBacklogIssueListFromApi(): Promise<any> {
    return this.http.get(`/api/issues?status=Backlog`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  getClosedIssueListFromApi(): Promise<any> {
    return this.http.get(`/api/issues?status=Closed`)
      .toPromise()
      .then(this.sendResponse)
      .catch(this.handleError);
  }

  getProjectInfo(): Promise<any> {
    return this.http.get(`/api/info`)
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
