import {Component, OnInit} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {JiraService} from '../core/jira.service'
import {PlanningPokerService} from '../core/contract-calls/planning-poker.service'
import {parseBigNumber, countStoryPoints} from '../shared/methods'
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
  parseBigNumber = parseBigNumber;
  countStoryPoints = countStoryPoints;

  public storyPointsOptions: number[] = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  public openedTasks: IPlanningPokerTask[] = [];
  public closedTasks: IPlanningPokerTask[] = [];
  public readyToDisplay = false;

  constructor(
    private _titleService: Title,
    private _jiraService: JiraService,
    private _planningPokerService: PlanningPokerService
  ) {
    const currentTitle = this._titleService.getTitle(),
          neededTitle = 'Scrum DAO - Planning poker';
    if (currentTitle !== neededTitle) {
      this._titleService.setTitle(neededTitle);
    }
  }

  ngOnInit() {
    const getVotingPromises = [];
    const getVotePromises = [];
    let tasks;
    this.getIssues()
      .then(getIssuesResponse => {
        tasks = _.cloneDeep(getIssuesResponse);
        tasks.forEach(item => {
          getVotingPromises.push(this._planningPokerService.getVoting(item.key));
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
          tasks[i].fields.awardPaid = getVotingPromisesResponse[i][4];
          getVotePromises.push(this._planningPokerService.getVote(tasks[i].key));
        });
        return Promise.all(getVotePromises)
      })
      .then(getVotePromisesResponse => {
        getVotePromisesResponse.forEach((item, i) => {
          tasks[i].fields.votesUserChoice = this.parseBigNumber(item);
          tasks[i].votingLoading = false;
          tasks[i].storyPointsLoading = false;
        });
        this.constructLinksToJira(tasks);
        this.sortOpenedAndClosedTasks(tasks);
        this.readyToDisplay = true;
      })
      .catch(err => {
        console.error('An error occurred on planning-poker.component in "OnInit" block:', err);
      });
  }

  getIssues(): Promise<any> {
    const issues: boolean[] = [];
    return this._jiraService.getBacklogIssueListFromApi()
      .then(response => {
        issues.push(...response);
        return this._jiraService.getClosedIssueListFromApi();
      })
      .then(getClosedIssueListFromApiResponse => {
        issues.push(...getClosedIssueListFromApiResponse);
        return issues;
      })
  }

  changeStoryPointsUserChoice(item: IPlanningPokerTask, id: string, val: number): void {
    item.votingLoading = true;
    item.storyPointsLoading = true;
    this._planningPokerService.vote(id, val)
      .then(() => {
        return this._planningPokerService.getVoting(item.key)
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

  constructLinksToJira(tasks): void {
    tasks.forEach(item => {
      item.link = item.self.split("/rest")[0] + "/browse/" + item.key;
    })
  }

  sortOpenedAndClosedTasks(tasks: IPlanningPokerTask[]): void {
    this.openedTasks = _.filter(tasks, (o) => (o.fields.isOpen || o.fields.votingWasNotCreated) &&
      o.fields.status.name === "Backlog");
    this.closedTasks = _.filter(tasks, (o) => !o.fields.isOpen && !o.fields.votingWasNotCreated && o.fields.awardPaid &&
      o.fields.status.name === "Closed");
  }
}
