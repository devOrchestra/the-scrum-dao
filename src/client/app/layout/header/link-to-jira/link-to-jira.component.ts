import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-link-to-jira',
  templateUrl: './link-to-jira.component.html',
  styleUrls: ['./link-to-jira.component.css']
})
export class LinkToJiraComponent implements OnInit {
  readyToDisplay = false;

  constructor() { }

  ngOnInit() {
    this.readyToDisplay = true;
  }

}
