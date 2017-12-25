import { Component, Input, ViewChild } from '@angular/core';
import { MdMenuTrigger } from '@angular/material'
import { PlanningPokerService } from '../../core/contract-calls/planning-poker.service'
import { countStoryPoints, parseBigNumber } from '../../shared/methods'
import { IPlanningPokerTask } from "../../shared/interfaces";
import { AlternativeControlFlashAnimation } from '../../shared/animations'

@Component({
  selector: 'app-planning-poker-task-item',
  templateUrl: './planning-poker-task-item.component.html',
  styleUrls: ['./planning-poker-task-item.component.css'],
  animations: [AlternativeControlFlashAnimation]
})
export class PlanningPokerTaskItemComponent {
  @Input() index: number;
  @Input() task: IPlanningPokerTask;
  @Input() componentForOpenedTask: boolean;
  @ViewChild(MdMenuTrigger) trigger: MdMenuTrigger;

  public storyPointsOptions: number[] = [1, 2, 3, 5, 8, 13, 20, 40, 100];
  public countStoryPoints = countStoryPoints;
  public parseBigNumber = parseBigNumber;

  constructor(
    private _planningPokerService: PlanningPokerService
  ) { }

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
        console.error('An error occurred on planning-poker-task-item.component in "changeStoryPointsUserChoice":', err);
        item.votingLoading = false;
        item.storyPointsLoading = false;
      });
  }

  openStoryPointsMenu(): void {
    if (this.componentForOpenedTask) { this.trigger.openMenu(); }
  }
}
