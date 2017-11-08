import { Injectable } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
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
        this._jiraService.getIssueListFromApi().then(response => {
          console.log('Issues resolver data:', response);
          this._jiraService.setIssues(response);
        })
      }
    });
  }
}
