import {Component, OnInit} from '@angular/core';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import project_artifacts from '../../../../build/contracts/Project.json'


@Component({
  selector: 'app-sprint-backlog',
  templateUrl: './sprint-backlog.component.html',
  styleUrls: ['./sprint-backlog.component.css']
})
export class SprintBacklogComponent implements OnInit {
  Project = contract(project_artifacts);
  lastSprint: any = {}

  constructor() {
  }

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed().then(contractInstance => {
      contractInstance.getLastSprintVoiting.call().then(data => {
        console.log('LAST', data);
        // (last.date, last.votes, last.started, last.finished, last.sprintBacklogHashes.length);
        this.lastSprint.date = new Date(parseInt(data[0], 10))
        this.lastSprint.votes = parseInt(data[1], 10)
        this.lastSprint.started = data[2]
        this.lastSprint.finished = data[3]
        this.lastSprint.backlogLenght = parseInt(data[4], 10)
        this.lastSprint.hash = data[5].toString()

        for (let i = 0; i < this.lastSprint.backlogLenght; i++) {
          contractInstance.getSprintBacklogItem.call(this.lastSprint.hash, i).then(data => {
            console.log('ITEM', data)
          })
        }

        console.log('INFO', this.lastSprint)
      })
    })
  }

}
