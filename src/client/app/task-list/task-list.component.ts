import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public storyPointsOptions: number[] = [0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100];
  public tasks: { [key: string]: string | number }[] = [
    {
      description: "Fake description 1",
      storyPoints: 0.5,
      issueId: "EMA-1"
    },
    {
      description: "Fake description 2",
      storyPoints: 1,
      issueId: "EMA-2"
    },
    {
      description: "Fake description 3",
      storyPoints: 2,
      issueId: "EMA-3"
    },
    {
      description: "Fake description 4",
      storyPoints: 3,
      issueId: "EMA-4"
    },
    {
      description: "Fake description 5",
      storyPoints: 100,
      issueId: "EMA-5"
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
