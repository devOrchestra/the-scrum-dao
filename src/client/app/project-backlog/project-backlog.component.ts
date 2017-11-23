import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import backlog_artifacts from '../../../../build/contracts/ProductBacklog.json';
import planningPoker_artifacts from '../../../../build/contracts/PlanningPoker.json';
import project_artifacts from '../../../../build/contracts/Project.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {countStoryPoints, countDecimals, parseBigNumber, gas} from '../shared/methods'
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
  gas = gas;

  public openedTasks: IBacklogTask[] = [];
  public closedTasks: IBacklogTask[] = [];
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
              getVotingPlanningPokerPromises = [],
              tasks: IBacklogTask[] = _.cloneDeep(data);
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
            tasks.forEach(item => {
              getVotingBacklogPromises.push(backlogContractInstance.getVoting(item.key));
              getVotingPlanningPokerPromises.push(planningPokerContractInstance.getVoting(item.key));
              item.storyPointsLoading = true;
              item.totalPercentsLoading = true;
            });
            const getVoteBacklog = [];
            tasks.forEach(item => {
              getVoteBacklog.push(backlogContractInstance.getVote(item.key, {gas: this.gas, from: web3.eth.accounts[0]}));
            });
            return Promise.all(getVoteBacklog);
          })
          .then(getVoteResponse => {
            getVoteResponse.forEach((item, i) => {
              tasks[i].userHasAlreadyVoted = this.parseBigNumber(item[0]) / this.decimals;
            });
            return Promise.all(getVotingBacklogPromises)
          })
          .then(getVotingBacklogResponse => {
            for (let i = 0; i < getVotingBacklogResponse.length; i++) {
              tasks[i].fields.votingWasNotCreated = getVotingBacklogResponse[i][0].length <= 0;
              tasks[i].fields.totalSupply = this.parseBigNumber(getVotingBacklogResponse[i][1]);
              tasks[i].fields.votingCount = this.parseBigNumber(getVotingBacklogResponse[i][2]);
              tasks[i].fields.isOpen = getVotingBacklogResponse[i][3];
            }
            return Promise.all(getVotingPlanningPokerPromises)
          })
          .then(getVotingPlanningPokerResponse => {
            for (let i = 0; i < getVotingPlanningPokerResponse.length; i++) {
              tasks[i].fields.storyPoints = this.countStoryPoints(
                getVotingPlanningPokerResponse[i][1],
                getVotingPlanningPokerResponse[i][2]
              );
              tasks[i].storyPointsLoading = false;
              tasks[i].totalPercentsLoading = false;
              tasks[i].bgcEasingApplied = true;
            }
            this.sortOpenedAndClosedTasks(tasks);
            this.readyToDisplay = true;
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
          return contractInstance.vote(id, {gas: this.gas, from: web3.eth.accounts[0]});
        })
        .then(voteResponse => {
          this.getVotingToUpdate(contractInstance, id, index, item);
        })
        .catch(err => {
          console.error('An error occurred on project-backlog.component in "voteFor":', err);
          item.storyPointsLoading = false;
          item.totalPercentsLoading = false;
        })
    }
  }

  getVotingToUpdate(contractInstance, id: string, index: number, item: IBacklogTask): void {
    contractInstance.getVoting(id)
      .then(getVotingResponse => {
        if (this.parseBigNumber(getVotingResponse[1]) === item.fields.totalSupply &&
            this.parseBigNumber(getVotingResponse[2]) === item.fields.votingCount) {
          this.getVotingToUpdate(contractInstance, id, index, item);
        } else {
          item.fields.totalSupply = this.parseBigNumber(getVotingResponse[1]);
          item.fields.votingCount = this.parseBigNumber(getVotingResponse[2]);
          contractInstance.getVote(id, {gas: this.gas, from: web3.eth.accounts[0]})
            .then(getVoteResponse => {
              item.userHasAlreadyVoted = this.parseBigNumber(getVoteResponse[0]) / this.decimals;
              item.storyPointsLoading = false;
              item.totalPercentsLoading = false;
              item.flashAnimation = "animate";
            })
            .catch(err => {
              console.error('An error occurred on project-backlog.component in "getVotingToUpdate":', err);
              item.storyPointsLoading = false;
              item.totalPercentsLoading = false;
            })
        }
      })
  }

  sortOpenedAndClosedTasks(tasks: IBacklogTask[]): void {
    this.openedTasks = _.filter(tasks, (o) => o.fields.isOpen || o.fields.votingWasNotCreated);
    this.closedTasks = _.filter(tasks, (o) => !o.fields.isOpen && !o.fields.votingWasNotCreated);
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
            return backlogContractInstance.addVoting(track, {gas: this.gas, from: web3.eth.accounts[0]});
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
