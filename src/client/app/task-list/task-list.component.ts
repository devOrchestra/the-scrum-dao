import {Component, OnInit} from '@angular/core';
import {JiraService} from '../core/jira.service'
import storyPointsVoting_artifacts from '../../../../build/contracts/StoryPointsVoting.json';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash'
import {AlternativeControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css'],
  animations: [AlternativeControlFlashAnimation, ShortEnterAnimation]
})
export class TaskListComponent implements OnInit {
  public storyPointsOptions: number[] = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  public tasks = [];
  public readyToDisplay = false;

  StoryPointsVoting = contract(storyPointsVoting_artifacts);

  constructor(public _jiraService: JiraService) {
  }

  ngOnInit() {
    const getVotingPromises = [];
    const getVotePromises = [];
    this._jiraService.getIssues().subscribe(data => {
      if (data) {
        this.tasks = _.cloneDeep(data);
        this.StoryPointsVoting.setProvider(web3.currentProvider);
        this.StoryPointsVoting.deployed().then(storyPointsVotingInstance => {
          this.tasks.forEach(item => {
            getVotingPromises.push(storyPointsVotingInstance.getVoting(item.key));
            item.votingLoading = true;
            item.storyPointsLoading = true;
          });
          this.readyToDisplay = true;
          Promise.all(getVotingPromises)
            .then(response => {
              console.log('getVotingPoker response', response);
              response.forEach(item => {
                item[1] = this.parseBigNumber(item[1]);
                item[2] = this.parseBigNumber(item[2]);
              });
              this.tasks.forEach((item, i) => {
                this.tasks[i].fields.votingWasNotCreated = response[i][0].length <= 0;
                this.tasks[i].fields.votesCount = response[i][1];
                this.tasks[i].fields.votesSum = response[i][2];
                this.tasks[i].fields.isOpen = response[i][3];
                getVotePromises.push(storyPointsVotingInstance.getVote(this.tasks[i].key, {from: web3.eth.accounts[0]}));
              });
              return Promise.all(getVotePromises)
            })
            .then(res => {
              res.forEach((item, i) => {
                this.tasks[i].fields.votesUserChoice = this.parseBigNumber(item);
                this.tasks[i].votingLoading = false;
                this.tasks[i].storyPointsLoading = false;
              });
              console.log('tasks', this.tasks);
            })
        })
      }
    })
  }

  changeStoryPointsUserChoice(item, id: string, val: number): void {
    item.votingLoading = true;
    item.storyPointsLoading = true;
    this.StoryPointsVoting.deployed()
      .then(storyPointsVotingInstance => {
        storyPointsVotingInstance.vote(id, val, {from: web3.eth.accounts[0], gas: 235000})
        .then(res => {
          return storyPointsVotingInstance.getVoting(item.key)
        })
        .then(response => {
          response[1] = this.parseBigNumber(response[1]);
          response[2] = this.parseBigNumber(response[2]);
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
          console.log('item after vote', item);
        })
        .catch(() => {
          item.votingLoading = false;
          item.storyPointsLoading = false;
        });
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

  parseBigNumber(item: number): number {
    return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
  }

  countStoryPoints(votesCount: number, votesSum: number): number {
    const result = votesSum / votesCount;
    if (!result) {
      return 0;
    } else {
      return Math.round(result);
    }
  }
}
