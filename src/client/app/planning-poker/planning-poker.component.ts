import {Component, OnInit} from '@angular/core';
import {JiraService} from '../core/jira.service'
import planningPoker_artifacts from '../../../../build/contracts/PlanningPoker.json';
import {default as contract} from 'truffle-contract'
import {parseBigNumber, countStoryPoints, gas} from '../shared/methods'
import * as _ from 'lodash'
import {AlternativeControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'
import { IPlanningPokerTask } from "../shared/interfaces";

@Component({
  selector: 'app-planning-poker',
  templateUrl: './planning-poker.component.html',
  styleUrls: ['./planning-poker.component.css'],
  animations: [AlternativeControlFlashAnimation, ShortEnterAnimation]
})
export class PlanningPokerComponent implements OnInit {
  PlanningPoker = contract(planningPoker_artifacts);

  parseBigNumber = parseBigNumber;
  countStoryPoints = countStoryPoints;
  gas = gas;

  public storyPointsOptions: number[] = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  public openedTasks: IPlanningPokerTask[] = [];
  public closedTasks: IPlanningPokerTask[] = [];
  public readyToDisplay = false;

  constructor(
    public _jiraService: JiraService
  ) { }

  ngOnInit() {
    let planningPokerInstance;
    const getVotingPromises = [];
    const getVotePromises = [];
    this._jiraService.getIssues().subscribe(data => {
      if (data) {
        const tasks = _.cloneDeep(data);
        this.PlanningPoker.setProvider(web3.currentProvider);
        this.PlanningPoker.deployed()
          .then(planningPokerInstanceResponse => {
            planningPokerInstance = planningPokerInstanceResponse;
            tasks.forEach(item => {
              getVotingPromises.push(planningPokerInstance.getVoting(item.key));
              item.votingLoading = true;
              item.storyPointsLoading = true;
            });
            return Promise.all(getVotingPromises);
          })
          .then(getVotingPromisesResponse => {
            getVotingPromisesResponse.forEach(item => {
              item[1] = this.parseBigNumber(item[1]);
              item[2] = this.parseBigNumber(item[2]);
            });
            tasks.forEach((item, i) => {
              tasks[i].fields.votingWasNotCreated = getVotingPromisesResponse[i][0].length <= 0;
              tasks[i].fields.votesCount = getVotingPromisesResponse[i][1];
              tasks[i].fields.votesSum = getVotingPromisesResponse[i][2];
              tasks[i].fields.isOpen = getVotingPromisesResponse[i][3];
              getVotePromises.push(planningPokerInstance.getVote(tasks[i].key, {from: web3.eth.accounts[0]}));
            });
            return Promise.all(getVotePromises)
          })
          .then(getVotePromisesResponse => {
            getVotePromisesResponse.forEach((item, i) => {
              tasks[i].fields.votesUserChoice = this.parseBigNumber(item);
              tasks[i].votingLoading = false;
              tasks[i].storyPointsLoading = false;
            });
            this.sortOpenedAndClosedTasks(tasks);
            this.readyToDisplay = true;
          })
          .catch(err => {
            console.error('An error occurred on planning-poker.component in "OnInit" block:', err);
          });
      }
    })
  }

  changeStoryPointsUserChoice(item: IPlanningPokerTask, id: string, val: number): void {
    let planningPokerInstance;
    item.votingLoading = true;
    item.storyPointsLoading = true;
    this.PlanningPoker.deployed()
      .then(planningPokerInstanceResponse => {
        planningPokerInstance = planningPokerInstanceResponse;
        return planningPokerInstance.vote(id, val, {from: web3.eth.accounts[0], gas: this.gas});
      })
      .then(() => {
        return planningPokerInstance.getVoting(item.key)
      })
      .then(getVotingResponse => {
        getVotingResponse[1] = this.parseBigNumber(getVotingResponse[1]);
        getVotingResponse[2] = this.parseBigNumber(getVotingResponse[2]);
        if (!item.fields.votesUserChoice) {
          item.fields.votesSum += val;
          item.fields.votesCount++;
        } else {
          if (item.fields.votesUserChoice - val > 0) {
            item.fields.votesSum -= item.fields.votesUserChoice - val;
          } else {
            item.fields.votesSum += val - item.fields.votesUserChoice;
          }
        }
        item.fields.votesUserChoice = val;
        item.votingLoading = false;
        item.storyPointsLoading = false;
        item.flashAnimation = "animate";
      })
      .catch(err => {
        console.error('An error occurred on planning-poker.component in "changeStoryPointsUserChoice":', err);
        item.votingLoading = false;
        item.storyPointsLoading = false;
      });
  }

  sortOpenedAndClosedTasks(tasks: IPlanningPokerTask[]): void {
    this.openedTasks = _.filter(tasks, (o) => o.fields.isOpen || o.fields.votingWasNotCreated);
    this.closedTasks = _.filter(tasks, (o) => !o.fields.isOpen && !o.fields.votingWasNotCreated);
  }
}
