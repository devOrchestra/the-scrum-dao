import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { JiraService } from '../jira.service';
import { Web3Service } from '../web3.service';

@Injectable()
export class JiraIssuesResolverService {

  constructor(
    private _web3Service: Web3Service,
    private _jiraService: JiraService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    this._web3Service.getConnectionState().subscribe(connectionState => {
      if (connectionState && (connectionState === "connected" || connectionState === "none")) {
        const issues: boolean[] = [];
        this._jiraService.getIssueListFromApi()
          .then(response => {
            issues.push(...response);
            return this._jiraService.getClosedIssueListFromApi();
          })
          .then(getClosedIssueListFromApiResponse => {
            issues.push(...getClosedIssueListFromApiResponse);
            this._jiraService.setIssues(issues);
          })
          .catch(err => {
            console.error('An error occurred on jira-issues-resolver.service:', err);
          });
      }
    });
  }
}
