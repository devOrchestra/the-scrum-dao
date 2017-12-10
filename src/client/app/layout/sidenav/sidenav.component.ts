import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ProjectService } from '../../core/contract-calls/project.service'

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {
  showSettingsLink: boolean;
  readyToRender = false;

  constructor(
    private _titleService: Title,
    private _projectService: ProjectService
  ) { }

  ngOnInit() {
    this._projectService.owner()
      .then(ownerResponse => {
        this.showSettingsLink = ownerResponse === web3.eth.accounts[0];
        this.readyToRender = true;
      })
  }

  changeTabName(titlePart: string) {
    this._titleService.setTitle(`Scrum DAO - ${titlePart}`);
  }
}
