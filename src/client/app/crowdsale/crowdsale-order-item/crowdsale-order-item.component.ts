import { Component, forwardRef, Inject, Input } from '@angular/core';
import { CrowdsaleComponent } from "../crowdsale.component";
import { CrowdsaleService } from '../../core/contract-calls/crowdsale.service'
import { ControlFlashAnimation } from "../../shared/animations";
import { IOrder } from "../../shared/interfaces";
import * as _ from 'lodash'

@Component({
  selector: 'app-crowdsale-order-item',
  templateUrl: './crowdsale-order-item.component.html',
  styleUrls: ['./crowdsale-order-item.component.css'],
  animations: [ControlFlashAnimation]
})
export class CrowdsaleOrderItemComponent {
  @Input() order: IOrder;
  @Input() index: number;
  @Input() type: string;

  tokenSymbol: string;
  currentOwner: string;
  visibleBuyOrdersLengthForOrderBook: number;

  /* Methods */
  closeOrder;
  // excludeItemFromList;

  constructor(
    @Inject(forwardRef(() => CrowdsaleComponent)) private _parent: CrowdsaleComponent,
    private _crowdsaleService: CrowdsaleService
  ) {
    this.currentOwner = this._parent.currentOwner;
    this.tokenSymbol = this._parent.tokenSymbol;
    this.visibleBuyOrdersLengthForOrderBook = this._parent.visibleBuyOrdersLengthForOrderBook;
    this.closeOrder = this._parent.closeOrder;
    // this.excludeItemFromList = this._parent.excludeItemFromList;
  }

  calculateFirstVisibleItemIndex(): number {
    let index;
    let flag = true;
    this._parent.orders.forEach((item, i) => {
      if (!item.isLocked && item.isOpen && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
  }

  countIndexOfTheLastVisibleSellOrderForOrderBook(index: number, order: IOrder): boolean {
    let allSellOrdersHaveIndexProperty = true;
    order.index = index;
    const visibleSellOrders = _.filter(this._parent.orders, {
      isOpen: true,
      isLocked: false,
      orderType: 'sell'
    });
    visibleSellOrders.forEach(item => {
      if (!item.hasOwnProperty('index')) { allSellOrdersHaveIndexProperty = false; }
    });
    if (allSellOrdersHaveIndexProperty) {
      const max = _.maxBy(visibleSellOrders, item => item.index);
      this._parent.maxIndexOfVisibleSellOrders = max && max.hasOwnProperty('index') && max.index >= 0 ? max.index : -1;
      return this._parent.maxIndexOfVisibleSellOrders === this.index;
    }
    return false;
  }

  excludeItemFromList(id: number, type: string, operationType: string): void {
    const itemToExcludeFromList = _.find(this._parent.orders, {id: id, orderType: type});
    itemToExcludeFromList.isOpen = false;
    itemToExcludeFromList.flashAnimation = "animate";
    const index = _.findIndex(this._parent.orders, itemToExcludeFromList);
    if (operationType === 'trade') {
      this._parent.orders[index].isOpen = false;
    } else if (operationType === 'close') {
      this._parent.orders[index].isLocked = true;
    }
    this._parent.closedOrders.unshift(itemToExcludeFromList);
    setTimeout(() => {
      if (type === "sell") {
        this._parent.visibleSellOrdersLengthForOrderBook = this._parent.visibleSellOrdersLengthForOrderBook === 0 ?
          0 : this._parent.visibleSellOrdersLengthForOrderBook - 1;
        this._parent.visibleSellOrdersLengthForClosedOrders += 1;
      } else if (type === "buy") {
        this.visibleBuyOrdersLengthForOrderBook = this.visibleBuyOrdersLengthForOrderBook === 0 ?
          0 : this.visibleBuyOrdersLengthForOrderBook - 1;
        this._parent.visibleBuyOrdersLengthForClosedOrders += 1;
      }
    }, 1000);
  }

  styleRow(e: any): void {
    let isRow = false;
    e.target.classList.forEach(i => {
      if (i === "item") { isRow = true }
    });
    if (e.type === 'mouseenter') {
      if (isRow) {
        e.target.style.backgroundColor = '#e1e1e1'
      } else {
        e.target.parentNode.parentNode.parentNode.style.backgroundColor = 'transparent'
      }
    } else if (e.type === 'mouseleave') {
      if (isRow) {
        e.target.style.backgroundColor = 'transparent'
      } else {
        e.target.parentNode.parentNode.parentNode.style.backgroundColor = '#e1e1e1'
      }
    }
  }
}
