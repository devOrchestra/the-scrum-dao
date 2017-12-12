import { Component } from '@angular/core';
declare function require(moduleName: string): any;
const { version: appVersion } = require('../../../../package.json');

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent {
  public appVersion;

  constructor() {
    this.appVersion = appVersion;
  }
}
