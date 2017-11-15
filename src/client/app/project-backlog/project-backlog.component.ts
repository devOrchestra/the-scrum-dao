import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import backlog_artifacts from '../../../../build/contracts/ProductBacklog.json';
import planningPoker_artifacts from '../../../../build/contracts/PlanningPoker.json';
import project_artifacts from '../../../../build/contracts/Project.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {AlternativeControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'

import * as moment from 'moment';

@Component({
  selector: 'app-project-backlog',
  templateUrl: './project-backlog.component.html',
  styleUrls: ['./project-backlog.component.css'],
  animations: [AlternativeControlFlashAnimation, ShortEnterAnimation]
})
export class ProjectBacklogComponent implements OnInit {
  @ViewChild('.vote-cloud') aUser: ElementRef;
  public items = [];
  public readyToDisplay = false;
  public decimals: number;

  Project = contract(project_artifacts);
  Backlog = contract(backlog_artifacts);
  PlanningPoker = contract(planningPoker_artifacts);

  constructor(
    private dialog: MdDialog,
    private _jiraService: JiraService
  ) {}


  ngOnInit() {
    this._jiraService.getIssues().subscribe(data => {
      if (data) {
        let planningPokerContractInstance,
            backlogContractInstance,
            projectContractInstance;
        const getVotingBacklogPromises = [],
              getVotingPlanningPokerPromises = [];
        this.items = _.cloneDeep(data);
        this.Project.setProvider(web3.currentProvider);
        this.Project.deployed()
          .then(projectContractInstanceResponse => {
            projectContractInstance = projectContractInstanceResponse;
            return projectContractInstance.decimals();
          })
          .then(decimalsResponse => {
            this.decimals = this.countDecimals(decimalsResponse);
            this.Backlog.setProvider(web3.currentProvider);
            return this.Backlog.deployed();
          })
          .then(backlogContractInstanceResponse => {
            backlogContractInstance = backlogContractInstanceResponse;
            this.PlanningPoker.setProvider(web3.currentProvider);
            return this.PlanningPoker.deployed();
          })
          .then(planningPokerContractInstanceResponse => {
            planningPokerContractInstance = planningPokerContractInstanceResponse;
            this.items.forEach(item => {
              getVotingBacklogPromises.push(backlogContractInstance.getVoting(item.key));
              getVotingPlanningPokerPromises.push(planningPokerContractInstance.getVoting(item.key));
              item.storyPointsLoading = true;
              item.totalPercentsLoading = true;
            });
            const getVoteBacklog = [];
            this.items.forEach(item => {
              getVoteBacklog.push(backlogContractInstance.getVote(item.key, {gas: 500000, from: web3.eth.accounts[0]}));
            });
            return Promise.all(getVoteBacklog);
          })
          .then(getVoteResponse => {
            console.log("getVoteResponse", getVoteResponse);
            getVoteResponse.forEach((item, i) => {
              this.items[i].userHasAlreadyVoted = this.parseBigNumber(item[0]) / this.decimals;
            });
            console.log('items', this.items);
            this.readyToDisplay = true;
            return Promise.all(getVotingBacklogPromises)
          })
          .then(response => {
            console.log('getVotingBacklog response', response);
            for (let i = 0; i < response.length; i++) {
              this.items[i].fields.votingWasNotCreated = response[i][0].length <= 0;
              this.items[i].fields.totalSupply = this.parseBigNumber(response[i][1]);
              this.items[i].fields.votingCount = this.parseBigNumber(response[i][2]);
              this.items[i].fields.isOpen = response[i][3];
            }
            return Promise.all(getVotingPlanningPokerPromises)
          })
          .then(response => {
            for (let i = 0; i < response.length; i++) {
              this.items[i].fields.storyPoints = this.countStoryPoints(response[i][1], response[i][2]);
              this.items[i].storyPointsLoading = false;
              this.items[i].totalPercentsLoading = false;
              this.items[i].bgcEasingApplied = true;
            }
          })
      }
    })
  }

  voteFor(item, id, index, isOpenForVote) {
    if (isOpenForVote) {
      item.storyPointsLoading = true;
      item.totalPercentsLoading = true;
      this.Backlog.deployed()
        .then(contractInstance => {
          console.log('id for voting', id);
          contractInstance.vote(id, {gas: 500000, from: web3.eth.accounts[0]})
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
          contractInstance.getVote(id, {gas: 500000, from: web3.eth.accounts[0]})
            .then(getVoteResponse => {
              console.log("getVoteResponse", getVoteResponse);
              this.items[index].userHasAlreadyVoted = this.parseBigNumber(getVoteResponse[0]) / this.decimals;
              this.items[index].storyPointsLoading = false;
              this.items[index].totalPercentsLoading = false;
              this.items[index].flashAnimation = "animate";
              console.log("this.items[index] AFTER", this.items[index]);
            })
            .catch(() => {
              this.items[index].storyPointsLoading = false;
              this.items[index].totalPercentsLoading = false;
            })
        }
      })
  }

  calculateFirstVisibleItemIndex(): number {
    let index;
    let flag = true;
    this.items.forEach((item, i) => {
      if ((item.fields.votingWasNotCreated === true || item.fields.isOpen === true) && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
  }

  countDecimals(numberOfNulls: number): number {
    let final = "1";
    const parsedNumberOfNulls = this.parseBigNumber(numberOfNulls);
    for (let i = 0; i < parsedNumberOfNulls; i++) {
      final += "0";
    }
    return Number(final)
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
