import {Component, OnInit} from '@angular/core';
import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import project_artifacts from '../../../../build/contracts/Project.json';
import {MdDialog} from '@angular/material';
import {ProjectBacklogAddTrackDialogComponent} from './project-backlog-add-track-dialog/project-backlog-add-track-dialog.component'
import {JiraService} from '../core/jira.service'

import * as moment from 'moment';

@Component({
  selector: 'app-project-backlog',
  templateUrl: './project-backlog.component.html',
  styleUrls: ['./project-backlog.component.css']
})
export class ProjectBacklogComponent implements OnInit {
  track: String;
  story: String;
  fakePercents = 10.123456789;
  // public items: { [key: string]: string | number }[] = [
  //   {
  //     description: "Fake description 1",
  //     storyPoints: 0.5,
  //     issueId: "EMA-1"
  //   },
  //   {
  //     description: "Fake description 2",
  //     storyPoints: 1,
  //     issueId: "EMA-2"
  //   },
  //   {
  //     description: "Fake description 3",
  //     storyPoints: 2,
  //     issueId: "EMA-3"
  //   },
  //   {
  //     description: "Fake description 4",
  //     storyPoints: 3,
  //     issueId: "EMA-4"
  //   },
  //   {
  //     description: "Fake description 5",
  //     storyPoints: 100,
  //     issueId: "EMA-5"
  //   }
  // ];
  public items = [];

  Project = contract(project_artifacts);

  constructor(
    public dialog: MdDialog,
    public _jiraService: JiraService
  ) {}


  ngOnInit() {
    // this.Project.setProvider(web3.currentProvider);
    // this.Project.deployed().then(contractInstance => {
    //   contractInstance.getBacklogLength.call().then(data => {
    //     const length = parseInt(data.toString(), 10);
    //     for (let i = 0; i < length; i++) {
    //       contractInstance.getUserStory.call(i).then(story => {
    //         story.push(i);
    //         this.items.push(this.parseUserStory(story))
    //       })
    //     }
    //   })
    // })

    this._jiraService.getIssues().subscribe(data => {
      this.items = _.cloneDeep(data);
    })
  }

  voteFor(i) {
    this.Project.deployed().then(contractInstance => {
      contractInstance.votePriority(i, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getUserStory.call(i).then(story => {
          let voitingItem = _.find(this.items, item => {
            return item.id === i;
          })
          story.push(i)
          console.log('voitingItem', voitingItem)
          if (voitingItem) {
            voitingItem.votes = parseInt(story[4].toString(), 10)
          }
        })
      })
    })
  }

  addStory(track: string, story: string) {
    this.Project.deployed().then(contractInstance => {
      contractInstance.addUserStory(track, story, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getBacklogLength.call().then(data => {
          const length = parseInt(data.toString(), 10);
          contractInstance.getUserStory.call(length - 1).then(story => {
            story.push(length - 1)
            this.items.push(this.parseUserStory(story))
          })
        })
      })
    })
  }

  parseUserStory(story) {
    return {
      track: story[0],
      requestor: story[1],
      story: story[2],
      date: moment(new Date(parseInt(story[3].toString(), 10))).format('DD.MM.YYYY'),
      votes: parseInt(story[4].toString(), 10),
      id: story[5]
    }
  }

  voteEstimatedTime(i, time) {
    console.log(i,time)
    time = parseInt(time,10)
    this.Project.deployed().then(contractInstance => {
      contractInstance.voteEstimatedTime(i, time, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
        contractInstance.getUserStory.call(i).then(story => {
          let voitingItem = _.find(this.items, item => {
            return item.id === i;
          })
          story.push(i)
          if (voitingItem) {
            voitingItem.avgEstimatedTime = parseFloat(story[5].toString())
          }
        })
      })
    })
  }

  voteForIssue(id: string): void {
    console.log("Voited issue id:", id);
  }

  openDialog() {
    const dialogRef = this.dialog.open(ProjectBacklogAddTrackDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      this.addStory(result.track, result.storyDescription);
    });
  }
}
