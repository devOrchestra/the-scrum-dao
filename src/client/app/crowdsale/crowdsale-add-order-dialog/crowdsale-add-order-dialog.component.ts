import { Component } from '@angular/core';
import { InputEnterLeaveAnimation } from '../../shared/animations';

@Component({
  selector: 'app-crowdsale-add-order-dialog',
  templateUrl: './crowdsale-add-order-dialog.component.html',
  styleUrls: ['./crowdsale-add-order-dialog.component.css'],
  animations: [InputEnterLeaveAnimation]
})
export class CrowdsaleAddOrderDialogComponent {
  orderTypes = [
    {
      value: 'buy',
      viewValue: 'Buy order'
    },
    {
      value: 'sell',
      viewValue: 'Sell order'
    }
  ];
  type: string;
  price: number;
  val: number;
  eth: number;

  resetHiddenInputs() {
    if (this.type === 'buy') {
      this.val = null;
    } else if (this.type === 'sell') {
      this.eth = null;
    }
  }

  sendData() {
    return {
      type: this.type,
      price: this.price,
      value: this.val,
      eth: this.eth
    };
  }
}
