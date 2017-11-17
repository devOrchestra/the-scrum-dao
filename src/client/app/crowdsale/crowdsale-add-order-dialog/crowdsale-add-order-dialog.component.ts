import { Component } from '@angular/core';
import { ShortEnterAnimation } from '../../shared/animations';

@Component({
  selector: 'app-crowdsale-add-order-dialog',
  templateUrl: './crowdsale-add-order-dialog.component.html',
  styleUrls: ['./crowdsale-add-order-dialog.component.css'],
  animations: [ShortEnterAnimation]
})
export class CrowdsaleAddOrderDialogComponent {
  orderTypes: { [key: string]: string }[] = [
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

  resetHiddenInputs(): void {
    if (this.type === 'buy') {
      this.val = null;
    } else if (this.type === 'sell') {
      this.eth = null;
    }
  }

  sendData(): { [key: string]: string | number } {
    return {
      type: this.type,
      price: this.price,
      value: this.val,
      eth: this.eth
    };
  }
}
