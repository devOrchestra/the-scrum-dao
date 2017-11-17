import { Component, Inject } from '@angular/core';
import {MD_DIALOG_DATA} from '@angular/material';

@Component({
  selector: 'app-crowdsale-add-buy-order-error-dialog',
  templateUrl: './crowdsale-add-buy-order-error-dialog.component.html',
  styleUrls: ['./crowdsale-add-buy-order-error-dialog.component.css']
})
export class CrowdsaleAddBuyOrderErrorDialogComponent {
  constructor(
    @Inject(MD_DIALOG_DATA) public data: any
  ) { }
}
