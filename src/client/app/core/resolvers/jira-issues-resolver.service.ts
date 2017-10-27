import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { JiraService } from '../jira.service';

@Injectable()
export class JiraIssuesResolverService {

  constructor(
    private _jiraService: JiraService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<any> {
    return this._jiraService.getIssueListFromApi().then(response => {
      console.log('Issues resolver data:', response);
      this._jiraService.setIssues(response);
    })
  }
}
