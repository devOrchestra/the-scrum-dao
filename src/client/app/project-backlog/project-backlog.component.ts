import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import backlog_artifacts from '../../../../build/contracts/ProductBacklog.json';
import planningPoker_artifacts from '../../../../build/contracts/PlanningPoker.json';
import project_artifacts from '../../../../build/contracts/Project.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {countStoryPoints, countDecimals, parseBigNumber} from '../shared/methods'
import {AlternativeControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'
import { IBacklogTask } from "../shared/interfaces";

@Component({
  selector: 'app-project-backlog',
  templateUrl: './project-backlog.component.html',
  styleUrls: ['./project-backlog.component.css'],
  animations: [AlternativeControlFlashAnimation, ShortEnterAnimation]
})
export class ProjectBacklogComponent implements OnInit {
  @ViewChild('.vote-cloud') aUser: ElementRef;
  Project = contract(project_artifacts);
  Backlog = contract(backlog_artifacts);
  PlanningPoker = contract(planningPoker_artifacts);

  countStoryPoints = countStoryPoints;
  countDecimals = countDecimals;
  parseBigNumber = parseBigNumber;

  public items: IBacklogTask[] = [];
  public readyToDisplay = false;
  public decimals: number;

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
            getVoteResponse.forEach((item, i) => {
              this.items[i].userHasAlreadyVoted = this.parseBigNumber(item[0]) / this.decimals;
            });
            this.readyToDisplay = true;
            return Promise.all(getVotingBacklogPromises)
          })
          .then(getVotingBacklogResponse => {
            for (let i = 0; i < getVotingBacklogResponse.length; i++) {
              this.items[i].fields.votingWasNotCreated = getVotingBacklogResponse[i][0].length <= 0;
              this.items[i].fields.totalSupply = this.parseBigNumber(getVotingBacklogResponse[i][1]);
              this.items[i].fields.votingCount = this.parseBigNumber(getVotingBacklogResponse[i][2]);
              this.items[i].fields.isOpen = getVotingBacklogResponse[i][3];
            }
            return Promise.all(getVotingPlanningPokerPromises)
          })
          .then(getVotingPlanningPokerResponse => {
            for (let i = 0; i < getVotingPlanningPokerResponse.length; i++) {
              this.items[i].fields.storyPoints = this.countStoryPoints(
                getVotingPlanningPokerResponse[i][1],
                getVotingPlanningPokerResponse[i][2]
              );
              this.items[i].storyPointsLoading = false;
              this.items[i].totalPercentsLoading = false;
              this.items[i].bgcEasingApplied = true;
            }
          })
          .catch(err => {
            console.error('An error occurred on project-backlog.component in "OnInit" block:', err);
          });
      }
    })
  }

  voteFor(item: IBacklogTask, id: string, index: number, isOpenForVote: boolean): void {
    if (isOpenForVote) {
      let contractInstance;
      item.storyPointsLoading = true;
      item.totalPercentsLoading = true;
      this.Backlog.deployed()
        .then(contractInstanceResponse => {
          contractInstance = contractInstanceResponse;
          return contractInstance.vote(id, {gas: 500000, from: web3.eth.accounts[0]});
        })
        .then(voteResponse => {
          this.getVotingToUpdate(contractInstance, id, index);
        })
        .catch(err => {
          console.error('An error occurred on project-backlog.component in "voteFor":', err);
          item.storyPointsLoading = false;
          item.totalPercentsLoading = false;
        })
    }
  }

  getVotingToUpdate(contractInstance, id: string, index: number): void {
    contractInstance.getVoting(id)
      .then(getVotingResponse => {
        if (this.parseBigNumber(getVotingResponse[1]) === this.items[index].fields.totalSupply &&
            this.parseBigNumber(getVotingResponse[2]) === this.items[index].fields.votingCount) {
          this.getVotingToUpdate(contractInstance, id, index);
        } else {
          this.items[index].fields.totalSupply = this.parseBigNumber(getVotingResponse[1]);
          this.items[index].fields.votingCount = this.parseBigNumber(getVotingResponse[2]);
          contractInstance.getVote(id, {gas: 500000, from: web3.eth.accounts[0]})
            .then(getVoteResponse => {
              this.items[index].userHasAlreadyVoted = this.parseBigNumber(getVoteResponse[0]) / this.decimals;
              this.items[index].storyPointsLoading = false;
              this.items[index].totalPercentsLoading = false;
              this.items[index].flashAnimation = "animate";
            })
            .catch(err => {
              console.error('An error occurred on project-backlog.component in "getVotingToUpdate":', err);
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

  countTotalPercents(votingCount: number, totalSupply: number): number {
    const result = votingCount / totalSupply * 100;
    if (!result && result !== 0) {
      return 0;
    } else {
      return Number(result.toFixed(1));
    }
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
            console.log("addVotingResponse", addVotingResponse);
            this.readyToDisplay = true;
          })
          .catch(err => {
            console.error('An error occurred on project-backlog.component in "openDialog":', err);
            this.readyToDisplay = true;
          })
      }
    });
  }
}
