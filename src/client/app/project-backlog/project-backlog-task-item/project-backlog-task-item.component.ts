import { Component, forwardRef, Inject, Input } from '@angular/core';
import { ProjectBacklogService } from '../../core/contract-calls/project-backlog.service'
import { parseBigNumber } from '../../shared/methods'
import { IBacklogTask } from "../../shared/interfaces";
import { AlternativeControlFlashAnimation } from '../../shared/animations'
import { ProjectBacklogComponent } from "../project-backlog.component";

@Component({
  selector: 'app-project-backlog-task-item',
  templateUrl: './project-backlog-task-item.component.html',
  styleUrls: ['./project-backlog-task-item.component.css'],
  animations: [AlternativeControlFlashAnimation]
})
export class ProjectBacklogTaskItemComponent {
  @Input() item: IBacklogTask;
  @Input() index: number;

  parseBigNumber = parseBigNumber;
  decimals = this._parent.decimals;

  constructor(
    private _projectBacklogService: ProjectBacklogService,
    @Inject(forwardRef(() => ProjectBacklogComponent)) private _parent: ProjectBacklogComponent
  ) { }

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

  countTotalPercents(votingCount: number, totalSupply: number): number {
    const result = votingCount / totalSupply * 100;
    if (!result && result !== 0) {
      return 0;
    } else {
      return Number(result.toFixed(1));
    }
  }
}
