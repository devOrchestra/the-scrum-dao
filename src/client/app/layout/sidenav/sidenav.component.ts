import { Component, OnInit } from '@angular/core';
import project_artifacts from '../../../../../build/contracts/Project.json'
import {default as contract} from 'truffle-contract'

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  Project = contract(project_artifacts);

  showSettingsLink: boolean;
  readyToRender = false;

  constructor() { }

  ngOnInit() {
    this.Project.setProvider(web3.currentProvider);
    this.Project.deployed()
      .then(contractInstance => {
        return contractInstance.owner();
      })
      .then(ownerResponse => {
        this.showSettingsLink = ownerResponse === web3.eth.accounts[0];
        this.readyToRender = true;
      })
  }

}
