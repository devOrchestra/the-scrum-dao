import { Component, OnInit } from '@angular/core';
import { JiraService } from '../../../core/jira.service'

@Component({
  selector: 'app-link-to-jira',
  templateUrl: './link-to-jira.component.html',
  styleUrls: ['./link-to-jira.component.css']
})
export class LinkToJiraComponent implements OnInit {
  readyToDisplay = false;
  linkToJiraProject;

  constructor(
    private _jiraService: JiraService
  ) { }

  ngOnInit() {
    this._jiraService.getProjectInfo()
      .then(getProjectInfoResponse => {
        this.linkToJiraProject = getProjectInfoResponse.project;
        this.readyToDisplay = true;
      })
      .catch(err => {
        console.error('An error occurred on link-to-jira.component in "OnInit" block:', err);
      });
  }
}
