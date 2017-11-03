import {Component, OnInit} from '@angular/core';
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import backlog_artifacts from '../../../../build/contracts/ProductBacklog.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {FlashAnimation} from '../shared/animations'

import * as moment from 'moment';

@Component({
  selector: 'app-project-backlog',
  templateUrl: './project-backlog.component.html',
  styleUrls: ['./project-backlog.component.css'],
  animations: [FlashAnimation]
})
export class ProjectBacklogComponent implements OnInit {
  track: String;
  story: String;
  public items = [];
  public readyToDisplay = false;

  Backlog = contract(backlog_artifacts);

  constructor(
    public dialog: MdDialog,
    public _jiraService: JiraService
  ) {}


  ngOnInit() {
    this._jiraService.getIssues().subscribe(data => {
      const promises = [];
      this.items = _.cloneDeep(data);
      this.Backlog.setProvider(web3.currentProvider);
      this.Backlog.deployed()
        .then(backlogContractInstance => {
          this.items.forEach(item => {
            promises.push(backlogContractInstance.getVoting(item.key));
            item.storyPointsLoading = true;
            item.totalPercentsLoading = true;
          });
          this.readyToDisplay = true;
          Promise.all(promises)
            .then(response => {
              console.log('getVoting response', response);
              for (let i = 0; i < response.length; i++) {
                response[i][1] = !parseInt(response[i][1].toString(), 10) ? 0 : parseInt(response[i][1].toString(), 10);
                response[i][2] = !parseInt(response[i][2].toString(), 10) ? 0 : parseInt(response[i][2].toString(), 10);
                this.items[i].fields.totalSupply = response[i][1];
                this.items[i].fields.votingCount = response[i][2];
                this.items[i].storyPointsLoading = false;
                this.items[i].totalPercentsLoading = false;
              }
              console.log('items', this.items);
            })
        })
    })
  }

  voteFor(item, id) {
    item.storyPointsLoading = true;
    item.totalPercentsLoading = true;
    this.Backlog.deployed()
      .then(contractInstance => {
        console.log('id for voting', id);
        contractInstance.vote(id, {gas: 500000, from: web3.eth.accounts[0]})
          .then(data => {
            item.storyPointsLoading = false;
            item.totalPercentsLoading = false;
            item.flashAnimation = "animate";
            console.log('vote response', data);
          })
          .catch(err => {
            item.storyPointsLoading = false;
            item.totalPercentsLoading = false;
            console.error('ERR', err);
          })
      })
  }

  countTotalPercents(votingCount, totalSupply) {
    const result = votingCount / totalSupply * 100;
    if (!result && result !== 0) {
      return 0;
    } else {
      return result.toFixed(1);
    }
  }

  openDialog() {
    const dialogRef = this.dialog.open(ProjectBacklogAddTrackDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      console.log('result.track', result.track, 'result.storyDescription', result.storyDescription);
    });
  }
}
