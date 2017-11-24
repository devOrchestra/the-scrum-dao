import { Component, OnInit } from '@angular/core';
import {CrowdsaleAddOrderDialogComponent} from './crowdsale-add-order-dialog/crowdsale-add-order-dialog.component'
import {CrowdsaleAddBuyOrderErrorDialogComponent} from './crowdsale-add-buy-order-error-dialog/crowdsale-add-buy-order-error-dialog.component'
import {MdDialog} from '@angular/material';
import {CrowdsaleService} from '../core/contract-calls/crowdsale.service'
import {ProjectService} from '../core/contract-calls/project.service'
import {parseBigNumber, countDecimals} from '../shared/methods'
import {ControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'
import * as _ from 'lodash'
import { IOrder } from "../shared/interfaces";

@Component({
  selector: 'app-crowdsale',
  templateUrl: './crowdsale.component.html',
  styleUrls: ['./crowdsale.component.css'],
  animations: [ControlFlashAnimation, ShortEnterAnimation]
})
export class CrowdsaleComponent implements OnInit {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  orders: IOrder[] = [];
  tokenSymbol: string;
  readyToDisplay = false;
  buyOrdersLength: number;
  visibleBuyOrdersLength = 0;
  sellOrdersLength: number;
  visibleSellOrdersLength = 0;
  decimals: number;
  currentOwner: string = web3.eth.accounts[0];
  maxIndexOfVisibleSellOrders: number;

  constructor(
    private dialog: MdDialog,
    private _projectService: ProjectService,
    private _crowdsaleService: CrowdsaleService
  ) { }

  ngOnInit() {
    const sellOrderPromises = [];
    const buyOrderPromises = [];
    this._projectService.decimals()
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        return this._projectService.symbol();
      })
      .then(symbolResponse => {
        this.tokenSymbol = symbolResponse;
        return this._crowdsaleService.getSellOrderLength();
      })
      .then(sellOrdersLengthResponse => {
        const sellOrdersLength = this.parseBigNumber(sellOrdersLengthResponse);
        this.sellOrdersLength = sellOrdersLength;
        for (let i = 0; i < sellOrdersLength; i++) {
          sellOrderPromises.push(this._crowdsaleService.getSellOrder(i));
        }
        return Promise.all(sellOrderPromises)
      })
      .then(sellOrders => {
        sellOrders.forEach(item => {
          item = this.formatOrder(item, 'sell');
          this.orders.push(item);
        });
        return this._crowdsaleService.getBuyOrderLength();
      })
      .then(buyOrdersLengthResponse => {
        const buyOrdersLength = this.parseBigNumber(buyOrdersLengthResponse);
        this.buyOrdersLength = buyOrdersLength;
        for (let i = 0; i < buyOrdersLength; i++) {
          buyOrderPromises.push(this._crowdsaleService.getBuyOrder(i));
        }
        return Promise.all(buyOrderPromises)
      })
      .then(buyOrders => {
        buyOrders.forEach(item => {
          item = this.formatOrder(item, 'buy');
          item.value /= this.decimals;
          this.orders.push(item);
        });
        this.countVisibleOrdersLength();
        this.readyToDisplay = true;
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "OnInit" block:', err);
      });
  }

  openAddOrderDialog(): void {
    const addOrderDialogRef = this.dialog.open(CrowdsaleAddOrderDialogComponent);
    addOrderDialogRef.afterClosed().subscribe(addOrderDialogResult => {
      const theSmallestPriceOfSellOrders = this.findTheSmallestPriceOfSellOrders();
      if (addOrderDialogResult && addOrderDialogResult.type && addOrderDialogResult.type === 'buy') {
        if (addOrderDialogResult.price < theSmallestPriceOfSellOrders || !theSmallestPriceOfSellOrders) {
          const eth = addOrderDialogResult.eth * this.decimals;
          const price = addOrderDialogResult.price * this.decimals;
          this._crowdsaleService.addBuyOrder(price, eth)
            .then(response => {
              this.getBuyOrderToUpdate(this.buyOrdersLength);
            })
            .catch(err => {
              console.error('An error occurred on crowdsale.component in "openAddOrderDialog":', err);
            });
        } else {
          this.dialog.open(CrowdsaleAddBuyOrderErrorDialogComponent, {data: theSmallestPriceOfSellOrders});
        }
      } else if (addOrderDialogResult && addOrderDialogResult.type && addOrderDialogResult.type === 'sell') {
        const price = addOrderDialogResult.price * this.decimals;
        this._crowdsaleService.addSellOrder(addOrderDialogResult.value, price)
          .then(response => {
            this.getSellOrderToUpdate(this.sellOrdersLength);
          })
          .catch(err => {
            console.error('An error occurred on crowdsale.component in "openAddOrderDialog":', err);
          });
      }
    });
  }

  getBuyOrderToUpdate(index: number): void {
    this._crowdsaleService.getBuyOrder(index)
      .then(buyOrder => {
        if (!buyOrder[0] || buyOrder[0].length === 0) {
          this.getBuyOrderToUpdate(this.visibleBuyOrdersLength);
          return;
        } else {
          buyOrder = this.formatOrder(buyOrder, 'buy');
          buyOrder.value /= this.decimals;
          buyOrder.flashAnimation = "animate";
          this.orders.push(buyOrder);
          this.buyOrdersLength += 1;
          this.countVisibleOrdersLength();
        }
      })
  }

  getSellOrderToUpdate(index: number): void {
    index = index ? index : 0;
    this._crowdsaleService.getSellOrder(index)
      .then(sellOrder => {
        if (!sellOrder[0] || sellOrder[0].length === 0) {
          this.getSellOrderToUpdate(this.sellOrdersLength);
          return;
        } else {
          sellOrder = this.formatOrder(sellOrder, 'sell');
          sellOrder.flashAnimation = "animate";
          this.orders.push(sellOrder);
          this.sellOrdersLength += 1;
          this.countVisibleOrdersLength();
        }
      })
  }

  tradeOrder(type: string, id: number): void {
    if (type === 'sell') {
      this.buy(id);
    } else if (type === 'buy') {
      this.sell(id);
    }
  }

  buy(id: number): void {
    this._crowdsaleService.buy(id)
      .then(buyResponse => {
        this.excludeItemFromList(id, 'sell');
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "buy":', err);
      });
  }

  sell(id: number): void {
    this._crowdsaleService.sell(id)
      .then(sellResponse => {
        this.excludeItemFromList(id, 'buy');
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "sell":', err);
      });
  }

  closeOrder(e: MouseEvent, type: string, id: number): void {
    e.stopPropagation();
    Promise.resolve()
      .then(() => {
        if (type === "sell") {
          return this._crowdsaleService.closeSellOrder(id);
        } else if (type === "buy") {
          return this._crowdsaleService.closeBuyOrder(id);
        }
      })
      .then(closeOrderResponse => {
        this.excludeItemFromList(id, type);
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "closeOrder":', err);
      });
  }

  countVisibleOrdersLength(): void {
    this.visibleBuyOrdersLength = !this.visibleBuyOrdersLength || this.visibleBuyOrdersLength > 0 ? 0 : this.visibleBuyOrdersLength;
    this.visibleSellOrdersLength = !this.visibleSellOrdersLength || this.visibleSellOrdersLength > 0 ? 0 : this.visibleSellOrdersLength;
    this.orders.forEach(item => {
      if (item.orderType === 'buy') {
        this.visibleBuyOrdersLength += this.checkShouldOrderBeVisible(item) ? 1 : 0;
      } else if (item.orderType === 'sell') {
        this.visibleSellOrdersLength += this.checkShouldOrderBeVisible(item) ? 1 : 0;
      }
    });
  }

  checkShouldOrderBeVisible(order: IOrder): boolean {
    return order.isOpen && !order.isLocked;
  }

  countIndexOfTheLastVisibleSellOrder(index: number, order: IOrder): number {
    let allSellOrdersHaveIndexProperty = true;
    order.index = index;
    const visibleSellOrders = _.filter(this.orders, {
      isOpen: true,
      isLocked: false,
      orderType: 'sell'
    });
    visibleSellOrders.forEach(item => {
      if (!item.hasOwnProperty('index')) { allSellOrdersHaveIndexProperty = false; }
    });
    if (allSellOrdersHaveIndexProperty) {
      const max = _.maxBy(visibleSellOrders, item => item.index);
      this.maxIndexOfVisibleSellOrders = max && max.hasOwnProperty('index') && max.index >= 0 ? max.index : -1;
      return this.maxIndexOfVisibleSellOrders;
    }
  }

  excludeItemFromList(id: number, type: string): void {
    const itemToExcludeFromList = _.find(this.orders, {id: id, orderType: type});
    itemToExcludeFromList.flashAnimation = "void";
    setTimeout(() => {
      itemToExcludeFromList.isOpen = false;
      const index = _.findIndex(this.orders, itemToExcludeFromList);
      this.orders.splice(index, 1);
      if (type === "sell") {
        this.sellOrdersLength -= 1
      } else if (type === "buy") {
        this.visibleBuyOrdersLength -= 1;
      }
    }, 1000);
  }

  calculateFirstVisibleItemIndex(): number {
    let index;
    let flag = true;
    this.orders.forEach((item, i) => {
      if (!item.isLocked && item.isOpen && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
  }

  findTheSmallestPriceOfSellOrders(): void {
    const sellOrders = _.filter(this.orders, {orderType: 'sell'});
    let minPriceOfSellOrders;
    sellOrders.forEach(item => {
      if (minPriceOfSellOrders) {
        if (item.price < minPriceOfSellOrders) { minPriceOfSellOrders = item.price }
      } else {
        minPriceOfSellOrders = item.price;
      }
    });
    return minPriceOfSellOrders;
  }

  formatOrder(item: IOrder, type: string): IOrder {
    for (let i = 1; i <= 3; i++) {
      item[i] = this.parseBigNumber(item[i]);
    }
    item = this.transformOrderToObject(item, type);
    item.price = item.price / this.decimals;
    return item;
  }

  transformOrderToObject(item: IOrder, orderType: string): IOrder {
    return {
      owner: item[0],
      value: item[1],
      price: item[2],
      id: item[3],
      isOpen: item[4],
      isLocked: item[5] || false,
      orderType: orderType
    }
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
