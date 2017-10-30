import { Component, OnInit } from '@angular/core';
import {default as Web3} from 'web3';
import {JiraService} from '../core/jira.service'
import storyPointsVoting_artifacts from '../../../../build/contracts/StoryPointsVoting.json';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash'
import * as Bignumber from 'bignumber.js'

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public storyPointsOptions: number[] = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
  public tasks = [];

  StoryPointsVoting = contract(storyPointsVoting_artifacts);

  constructor(
    public _jiraService: JiraService
  ) { }

  ngOnInit() {
    const promises = [];
    this._jiraService.getIssues().subscribe(data => {
      this.tasks = _.cloneDeep(data);
      this.StoryPointsVoting.setProvider(web3.currentProvider);
      this.StoryPointsVoting.deployed().then(storyPointsVotingInstance => {
        this.tasks.forEach(item => {
          promises.push(storyPointsVotingInstance.getVoting(item.key));
        });
        Promise.all(promises).then(response => {
          response.forEach(item => {
            item[1] = !parseInt(item[1].toString(), 10) ? 0 : parseInt(item[1].toString(), 10);
            item[2] = !parseInt(item[2].toString(), 10) ? 0 : parseInt(item[2].toString(), 10);
          });
          this.tasks.forEach((item, i) => {
            /* !!! UNCOMMENT AFTER REAL DATA!!! */
            // const task = _.find(this.tasks, {key: response[i][0]});
            // task.fields.votesCount = response[i][1];
            // task.fields.votesSum = response[i][2];
            /* !!!DELETE 2 BELOW ROWS AFTER REAL DATA!!! */
            this.tasks[i].fields.votesCount = response[i][1];
            this.tasks[i].fields.votesSum = response[i][2];
          });
          console.log('this.tasks', this.tasks);
        })
      })
    })
  }

  changeStoryPointsUserChoice(id: string, val: number): void {
    console.log('id', id, 'val', val);
    console.log('new bignumber.', new Bignumber(12));
    const item = _.find(this.tasks, {key: id});
    item.storyPointsUserChoice = val;

    this.StoryPointsVoting.deployed().then(storyPointsVotingInstance => {
      storyPointsVotingInstance.vote(id, new Bignumber(val)).then(res => {
        console.log('res', res);
      });
    });
  }

  countStoryPoints(votesCount, votesSum) {
    const result = votesCount / votesSum;
    if (!result && result !== 0) {
      return 0;
    } else {
      return Math.round(result);
    }
  }
}
