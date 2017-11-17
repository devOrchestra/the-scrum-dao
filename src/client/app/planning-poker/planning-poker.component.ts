import {Component, OnInit} from '@angular/core';
import {JiraService} from '../core/jira.service'
import planningPoker_artifacts from '../../../../build/contracts/PlanningPoker.json';
import {default as contract} from 'truffle-contract'
import {parseBigNumber, countStoryPoints} from '../shared/methods'
import * as _ from 'lodash'
import {AlternativeControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'

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

  public storyPointsOptions: number[] = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  public tasks = [];
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
        this.tasks = _.cloneDeep(data);
        this.PlanningPoker.setProvider(web3.currentProvider);
        this.PlanningPoker.deployed()
          .then(planningPokerInstanceResponse => {
            planningPokerInstance = planningPokerInstanceResponse;
            this.tasks.forEach(item => {
              getVotingPromises.push(planningPokerInstance.getVoting(item.key));
              item.votingLoading = true;
              item.storyPointsLoading = true;
            });
            this.readyToDisplay = true;
            return Promise.all(getVotingPromises);
          })
          .then(getVotingPromisesResponse => {
            getVotingPromisesResponse.forEach(item => {
              item[1] = this.parseBigNumber(item[1]);
              item[2] = this.parseBigNumber(item[2]);
            });
            this.tasks.forEach((item, i) => {
              this.tasks[i].fields.votingWasNotCreated = getVotingPromisesResponse[i][0].length <= 0;
              this.tasks[i].fields.votesCount = getVotingPromisesResponse[i][1];
              this.tasks[i].fields.votesSum = getVotingPromisesResponse[i][2];
              this.tasks[i].fields.isOpen = getVotingPromisesResponse[i][3];
              getVotePromises.push(planningPokerInstance.getVote(this.tasks[i].key, {from: web3.eth.accounts[0]}));
            });
            return Promise.all(getVotePromises)
          })
          .then(getVotePromisesResponse => {
            getVotePromisesResponse.forEach((item, i) => {
              this.tasks[i].fields.votesUserChoice = this.parseBigNumber(item);
              this.tasks[i].votingLoading = false;
              this.tasks[i].storyPointsLoading = false;
            });
          })
          .catch(err => {
            console.error('An error occurred on planning-poker.component in "OnInit" block:', err);
          });
      }
    })
  }

  changeStoryPointsUserChoice(item, id: string, val: number): void {
    let planningPokerInstance;
    item.votingLoading = true;
    item.storyPointsLoading = true;
    this.PlanningPoker.deployed()
      .then(planningPokerInstanceResponse => {
        planningPokerInstance = planningPokerInstanceResponse;
        return planningPokerInstance.vote(id, val, {from: web3.eth.accounts[0], gas: 235000});
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

  calculateFirstVisibleItemIndex(): number {
    let index;
    let flag = true;
    this.tasks.forEach((item, i) => {
      if ((item.fields.votingWasNotCreated === true || item.fields.isOpen === true) && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
  }
}
