import {Component, OnInit} from '@angular/core';
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import backlog_artifacts from '../../../../build/contracts/ProductBacklog.json';
import storyPoints_artifacts from '../../../../build/contracts/StoryPointsVoting.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {FlashAnimation, ShortEnterAnimation} from '../shared/animations'

import * as moment from 'moment';

@Component({
  selector: 'app-project-backlog',
  templateUrl: './project-backlog.component.html',
  styleUrls: ['./project-backlog.component.css'],
  animations: [FlashAnimation, ShortEnterAnimation]
})
export class ProjectBacklogComponent implements OnInit {
  public items = [];
  public readyToDisplay = false;

  Backlog = contract(backlog_artifacts);
  StoryPoints = contract(storyPoints_artifacts);

  constructor(
    public dialog: MdDialog,
    public _jiraService: JiraService
  ) {}


  ngOnInit() {
    this._jiraService.getIssues().subscribe(data => {
      if (data) {
        const getVotingBacklogPromises = [];
        const getVotingStoryPointsPromises = [];
        this.items = _.cloneDeep(data);
        this.Backlog.setProvider(web3.currentProvider);
        this.Backlog.deployed()
          .then(backlogContractInstance => {
            this.StoryPoints.setProvider(web3.currentProvider);
            this.StoryPoints.deployed()
              .then(storyPointsContractInstance => {
                this.items.forEach(item => {
                  getVotingBacklogPromises.push(backlogContractInstance.getVoting(item.key));
                  getVotingStoryPointsPromises.push(storyPointsContractInstance.getVoting(item.key));
                  item.storyPointsLoading = true;
                  item.totalPercentsLoading = true;
                });
                this.readyToDisplay = true;
                return Promise.all(getVotingBacklogPromises)
              })
              .then(response => {
                console.log('getVotingBacklog response', response);
                for (let i = 0; i < response.length; i++) {
                  this.items[i].fields.totalSupply = this.parseBigNumber(response[i][1]);
                  this.items[i].fields.votingCount = this.parseBigNumber(response[i][2]);
                }
                return Promise.all(getVotingStoryPointsPromises)
              })
              .then(response => {
                for (let i = 0; i < response.length; i++) {
                  this.items[i].fields.storyPoints = this.countStoryPoints(response[i][1], response[i][2]);
                  this.items[i].storyPointsLoading = false;
                  this.items[i].totalPercentsLoading = false;
                }
                console.log('items', this.items);
              })
          })
      }
    })
  }

  voteFor(item, id, index) {
    item.storyPointsLoading = true;
    item.totalPercentsLoading = true;
    this.Backlog.deployed()
      .then(contractInstance => {
        console.log('id for voting', id);
        contractInstance.getVote(id)
          .then(getVoteResponse => {
            console.log('this.parseBigNumber(getVoteResponse)', this.parseBigNumber(getVoteResponse));
            if (this.parseBigNumber(getVoteResponse) === 0) {
              return contractInstance.vote(id, {gas: 500000, from: web3.eth.accounts[0]});
            } else {
              alert('!');
            }
          })
          .then(voteResponse => {
            console.log('vote response', voteResponse);
            this.getVotingToUpdate(contractInstance, id, index);
          })
          .catch(err => {
            item.storyPointsLoading = false;
            item.totalPercentsLoading = false;
          })
      })
  }

  countStoryPoints(votesCount: number, votesSum: number): number {
    const result = votesSum / votesCount;
    if (!result) {
      return 0;
    } else {
      return Math.round(result);
    }
  }

  getVotingToUpdate(contractInstance, id, index) {
    contractInstance.getVoting(id)
      .then(getVotingResponse => {
        if (this.parseBigNumber(getVotingResponse[1]) === this.items[index].fields.totalSupply &&
            this.parseBigNumber(getVotingResponse[2]) === this.items[index].fields.votingCount) {
          this.getVotingToUpdate(contractInstance, id, index);
        } else {
          console.log("getVotingResponse", getVotingResponse);
          console.log("this.items[index] BEFORE", this.items[index]);
          this.items[index].fields.totalSupply = this.parseBigNumber(getVotingResponse[1]);
          this.items[index].fields.votingCount = this.parseBigNumber(getVotingResponse[2]);
          this.items[index].storyPointsLoading = false;
          this.items[index].totalPercentsLoading = false;
          this.items[index].flashAnimation = "animate";
          console.log("this.items[index] AFTER", this.items[index]);
        }
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

  parseBigNumber(item: number): number {
    return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ProjectBacklogAddTrackDialogComponent);
    dialogRef.afterClosed().subscribe(track => {
      if (track) {
        this.readyToDisplay = false;
        this.Backlog.setProvider(web3.currentProvider);
        this.Backlog.deployed()
          .then(backlogContractInstance => {
            return backlogContractInstance.addVoting(track, {gas: 500000, from: web3.eth.accounts[0]});
          })
          .then(addVotingResponse => {
            console.log('addVotingResponse', addVotingResponse);
            this.readyToDisplay = true;
          })
          .catch(() => {
            this.readyToDisplay = true;
          })
      }
    });
  }
}
