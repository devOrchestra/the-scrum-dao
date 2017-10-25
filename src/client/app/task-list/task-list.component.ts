import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  public tasks: { [key: string]: string }[] = [
    {
      id: "fakeID12345678901",
      description: "The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.",
      storyPoints: "HZHZHZ1"
    },
    {
      id: "fakeID12345678902",
      description: "The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.",
      storyPoints: "HZHZHZ2"
    },
    {
      id: "fakeID12345678903",
      description: "The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.",
      storyPoints: "HZHZHZ3"
    },
    {
      id: "fakeID12345678904",
      description: "The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.",
      storyPoints: "HZHZHZ4"
    },
    {
      id: "fakeID12345678905",
      description: "The Shiba Inu is the smallest of the six original and distinct spitz breeds of dog from Japan. A small, agile dog that copes very well with mountainous terrain, the Shiba Inu was originally bred for hunting.",
      storyPoints: "HZHZHZ5"
    }
  ];

  constructor() { }

  ngOnInit() {
  }

}
