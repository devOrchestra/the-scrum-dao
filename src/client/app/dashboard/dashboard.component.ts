import {Component, OnInit} from '@angular/core';
import {default as contract} from 'truffle-contract'
import * as _ from 'lodash';
import project_artifacts from '../../../../build/contracts/Project.json'


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  track: String;
  story: String;

  public items = [];

  Project = contract(project_artifacts);

  constructor() {
    console.log('DASHBOARD')
  }


  ngOnInit() {
    // this.Project.setProvider(web3.currentProvider);
    // this.Project.deployed().then(contractInstance => {
    //   contractInstance.getBacklogLength.call().then(data => {
    //     const length = parseInt(data.toString(), 10);
    //     for (let i = 0; i < length; i++) {
    //       contractInstance.getUserStory.call(i).then(story => {
    //         console.log(story)
    //         story.push(i)
    //         this.items.push(this.parseUserStory(story))
    //       })
    //     }
    //   })
    // })
  }

  // voteFor(i) {
    // this.Project.deployed().then(contractInstance => {
    //   contractInstance.votePriority(i, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
    //     contractInstance.getUserStory.call(i).then(story => {
    //       let voitingItem = _.find(this.items, item => {
    //         return item.id === i;
    //       })
    //       story.push(i)
    //       if (voitingItem) {
    //         voitingItem.votes = parseInt(story[4].toString(), 10)
    //       }
    //     })
    //   })
    // })
  // }

  // addStory() {
    // this.Project.deployed().then(contractInstance => {
    //   contractInstance.addUserStory(this.track, this.story, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
    //     contractInstance.getBacklogLength.call().then(data => {
    //       const length = parseInt(data.toString(), 10);
    //       contractInstance.getUserStory.call(length - 1).then(story => {
    //         story.push(length - 1)
    //         this.items.push(this.parseUserStory(story))
    //       })
    //     })
    //   })
    // })
  // }

  // parseUserStory(story) {
  //   console.log(story[5].toString())
  //   return {
  //     track: story[0],
  //     requestor: story[1],
  //     story: story[2],
  //     date: new Date(parseInt(story[3].toString(), 10)),
  //     votes: parseInt(story[4].toString(), 10),
  //     avgEstimatedTime: parseFloat(story[5].toString()),
  //     id: story[6]
  //   }
  // }

  // voteEstimatedTime(i, time) {
  //   time = parseInt(time, 10)
  //   this.Project.deployed().then(contractInstance => {
  //     contractInstance.voteEstimatedTime(i, time, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
  //       contractInstance.getUserStory.call(i).then(story => {
  //         let voitingItem = _.find(this.items, item => {
  //           return item.id === i;
  //         })
  //         story.push(i)
  //         if (voitingItem) {
  //           voitingItem.avgEstimatedTime = parseFloat(story[5].toString())
  //         }
  //       })
  //     })
  //   })
  // }
  //
  // initiateSprintVoiting() {
  //   const selected = _.filter(this.items, item => {
  //     return item.selected === true;
  //   })
  //   const ids = []
  //   selected.forEach(s => {
  //     ids.push(s.id)
  //   })
  //   this.Project.deployed().then(contractInstance => {
  //     contractInstance.initiateSprintVoiting(ids, {gas: 500000, from: web3.eth.accounts[0]}).then(data => {
  //       console.log('VOITINGADDED',data)
  //       contractInstance.getLastSprintVoiting.call().then(data => {
  //         console.log('INFO',data)
  //       })
  //     })
  //   })
  // }

}
