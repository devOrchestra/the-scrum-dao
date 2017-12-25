import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-view-main-spinner',
  templateUrl: './view-main-spinner.component.html',
  styleUrls: ['./view-main-spinner.component.css']
})
export class ViewMainSpinnerComponent {
  @Input() public readyToDisplay: boolean;

  constructor() { }
}
