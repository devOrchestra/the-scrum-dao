import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import {Title} from '@angular/platform-browser';
import * as _ from 'lodash';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'
import {PlanningPokerService} from '../core/contract-calls/planning-poker.service'
import {ProjectBacklogService} from '../core/contract-calls/project-backlog.service'
import {ProjectService} from '../core/contract-calls/project.service'
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

  countStoryPoints = countStoryPoints;
  countDecimals = countDecimals;
  parseBigNumber = parseBigNumber;

  public openedTasks: IBacklogTask[] = [];
  public closedTasks: IBacklogTask[] = [];
  public readyToDisplay = false;
  public decimals: number;

  constructor(
    private _titleService: Title,
    private dialog: MdDialog,
    private _jiraService: JiraService,
    private _planningPokerService: PlanningPokerService,
    private _projectBacklogService: ProjectBacklogService,
    private _projectService: ProjectService
  ) {
    const currentTitle = this._titleService.getTitle(),
          neededTitle = 'Scrum DAO - Project backlog';
    if (currentTitle !== neededTitle) {
      this._titleService.setTitle(neededTitle);
    }
  }


  ngOnInit() {
    this._jiraService.getIssues().subscribe(data => {
      if (data) {
        const getVotingBacklogPromises = [],
              getVotingPlanningPokerPromises = [],
              tasks: IBacklogTask[] = _.cloneDeep(data);
        this._projectService.decimals()
          .then(decimalsResponse => {
            this.decimals = this.countDecimals(decimalsResponse);
            tasks.forEach(item => {
              getVotingBacklogPromises.push(this._projectBacklogService.getVoting(item.key));
              getVotingPlanningPokerPromises.push(this._planningPokerService.getVoting(item.key));
              item.storyPointsLoading = true;
              item.totalPercentsLoading = true;
            });
            const getVoteBacklog = [];
            tasks.forEach(item => {
              getVoteBacklog.push(this._projectBacklogService.getVote(item.key));
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
      item.storyPointsLoading = true;
      item.totalPercentsLoading = true;
      this._projectBacklogService.vote(id)
        .then(voteResponse => {
          this.getVotingToUpdate(id, index, item);
        })
        .catch(err => {
          console.error('An error occurred on project-backlog.component in "voteFor":', err);
          item.storyPointsLoading = false;
          item.totalPercentsLoading = false;
        })
    }
  }

  getVotingToUpdate(id: string, index: number, item: IBacklogTask): void {
    this._projectBacklogService.getVoting(id)
      .then(getVotingResponse => {
        if (this.parseBigNumber(getVotingResponse[1]) === item.fields.totalSupply &&
            this.parseBigNumber(getVotingResponse[2]) === item.fields.votingCount) {
          this.getVotingToUpdate(id, index, item);
        } else {
          item.fields.totalSupply = this.parseBigNumber(getVotingResponse[1]);
          item.fields.votingCount = this.parseBigNumber(getVotingResponse[2]);
          this._projectBacklogService.getVote(id)
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
        this._projectBacklogService.addVoting(track)
          .then(addVotingResponse => {
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
