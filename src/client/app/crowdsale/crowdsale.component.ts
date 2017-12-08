import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {CrowdsaleAddOrderDialogComponent} from './crowdsale-add-order-dialog/crowdsale-add-order-dialog.component'
import {CrowdsaleAddBuyOrderErrorDialogComponent} from './crowdsale-add-buy-order-error-dialog/crowdsale-add-buy-order-error-dialog.component'
import {MdDialog} from '@angular/material';
import {CrowdsaleService} from '../core/contract-calls/crowdsale.service'
import {ProjectService} from '../core/contract-calls/project.service'
import {parseBigNumber, countDecimals, formatOrder, transformOrderToObject} from '../shared/methods'
import {ControlFlashAnimation, ControlFlashAnimationReversed, ShortEnterAnimation} from '../shared/animations'
import * as _ from 'lodash'
import { IOrder } from "../shared/interfaces";

@Component({
  selector: 'app-crowdsale',
  templateUrl: './crowdsale.component.html',
  styleUrls: ['./crowdsale.component.css'],
  animations: [ControlFlashAnimation, ControlFlashAnimationReversed, ShortEnterAnimation]
})
export class CrowdsaleComponent implements OnInit {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;
  formatOrder = formatOrder;

  orders: IOrder[] = [];
  closedOrders: IOrder[] = [];
  tokenSymbol: string;
  readyToDisplay = false;
  buyOrdersLength: number;
  visibleBuyOrdersLengthForOrderBook = 0;
  visibleBuyOrdersLengthForClosedOrders = 0;
  sellOrdersLength: number;
  visibleSellOrdersLengthForOrderBook = 0;
  visibleSellOrdersLengthForClosedOrders = 0;
  decimals: number;
  currentOwner: string = web3.eth.accounts[0];
  maxIndexOfVisibleSellOrders: number;

  constructor(
    private _titleService: Title,
    private dialog: MdDialog,
    private _projectService: ProjectService,
    private _crowdsaleService: CrowdsaleService
  ) {
    const currentTitle = this._titleService.getTitle(),
          neededTitle = 'Scrum DAO - Crowdsale';
    if (currentTitle !== neededTitle) {
      this._titleService.setTitle(neededTitle);
    }
  }

  ngOnInit() {
    const sellOrderPromises = [];
    const buyOrderPromises = [];
    this.getOrders()
      .then(getOrdersResponse => {
        this.orders = getOrdersResponse;
        getOrdersResponse.forEach(item => {
          if (!item.isOpen) {
            this.closedOrders.push(item);
          }
        });
        this.sellOrdersLength = _.filter(this.orders, order => order.orderType === 'sell').length;
        this.buyOrdersLength = _.filter(this.orders, order => order.orderType === 'buy').length;
        return this._projectService.symbol();
      })
      .then(symbolResponse => {
        this.tokenSymbol = symbolResponse;
        this.countVisibleOrdersLengthForOrderBook();
        this.countVisibleOrdersLengthForClosedOrders();
        this.readyToDisplay = true;
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "OnInit" block:', err);
      });
  }

  getOrders(): Promise<any> {
    let sellOrdersLength: number,
      buyOrdersLength: number;
    const sellOrderPromises = [],
      buyOrderPromises = [],
      orders = [];
    return this._projectService.decimals()
      .then(decimalsResponse => {
        this.decimals = this.countDecimals(decimalsResponse);
        return this._crowdsaleService.getSellOrderLength();
      })
      .then(sellOrdersLengthResponse => {
        sellOrdersLength = this.parseBigNumber(sellOrdersLengthResponse);
        for (let i = 0; i < sellOrdersLength; i++) {
          sellOrderPromises.push(this._crowdsaleService.getSellOrder(i));
        }
        return Promise.all(sellOrderPromises)
      })
      .then(sellOrders => {
        sellOrders.forEach(item => {
          item = this.formatOrder(item, 'sell', this.decimals);
          item.value /= this.decimals;
          orders.push(item);
        });
        return this._crowdsaleService.getBuyOrderLength();
      })
      .then(buyOrdersLengthResponse => {
        buyOrdersLength = this.parseBigNumber(buyOrdersLengthResponse);
        for (let i = 0; i < buyOrdersLength; i++) {
          buyOrderPromises.push(this._crowdsaleService.getBuyOrder(i));
        }
        return Promise.all(buyOrderPromises)
      })
      .then(buyOrders => {
        buyOrders.forEach(item => {
          item = this.formatOrder(item, 'buy', this.decimals);
          item.value /= this.decimals;
          orders.push(item);
        });
        return orders;
      })
  }

  openAddOrderDialog(): void {
    const addOrderDialogRef = this.dialog.open(CrowdsaleAddOrderDialogComponent);
    addOrderDialogRef.afterClosed().subscribe(addOrderDialogResult => {
      const theSmallestPriceOfSellOrders = this.findTheSmallestPriceOfOpenedSellOrders();
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
        const value = addOrderDialogResult.value * this.decimals;
        this._crowdsaleService.addSellOrder(value, price)
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
          this.getBuyOrderToUpdate(this.visibleBuyOrdersLengthForOrderBook);
          return;
        } else {
          buyOrder = this.formatOrder(buyOrder, 'buy', this.decimals);
          buyOrder.value /= this.decimals;
          buyOrder.flashAnimation = "animate";
          this.orders.push(buyOrder);
          this.buyOrdersLength += 1;
          this.countVisibleOrdersLengthForOrderBook();
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
          sellOrder = this.formatOrder(sellOrder, 'sell', this.decimals);
          sellOrder.value /= this.decimals;
          sellOrder.flashAnimation = "animate";
          this.orders.push(sellOrder);
          this.sellOrdersLength += 1;
          this.countVisibleOrdersLengthForOrderBook();
        }
      })
  }

  tradeOrder(type: string, id: number, value: number): void {
    value *= this.decimals;
    if (type === 'sell') {
      this.buy(id, value);
    } else if (type === 'buy') {
      this.sell(id);
    }
  }

  buy(id: number, value: number): void {
    this._crowdsaleService.buy(id, value)
      .then(buyResponse => {
        this.excludeItemFromList(id, 'sell', 'trade');
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "buy":', err);
      });
  }

  sell(id: number): void {
    this._crowdsaleService.sell(id)
      .then(sellResponse => {
        this.excludeItemFromList(id, 'buy', 'trade');
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
        this.excludeItemFromList(id, type, 'close');
      })
      .catch(err => {
        console.error('An error occurred on crowdsale.component in "closeOrder":', err);
      });
  }

  countVisibleOrdersLengthForOrderBook(): void {
    this.visibleBuyOrdersLengthForOrderBook = !this.visibleBuyOrdersLengthForOrderBook ||
      this.visibleBuyOrdersLengthForOrderBook > 0 ? 0 : this.visibleBuyOrdersLengthForOrderBook;
    this.visibleSellOrdersLengthForOrderBook = !this.visibleSellOrdersLengthForOrderBook ||
      this.visibleSellOrdersLengthForOrderBook > 0 ? 0 : this.visibleSellOrdersLengthForOrderBook;
    this.orders.forEach(item => {
      if (item.orderType === 'buy') {
        this.visibleBuyOrdersLengthForOrderBook += item.isOpen && !item.isLocked ? 1 : 0;
      } else if (item.orderType === 'sell') {
        this.visibleSellOrdersLengthForOrderBook += item.isOpen && !item.isLocked ? 1 : 0;
      }
    });
  }

  countVisibleOrdersLengthForClosedOrders(): void {
    this.visibleBuyOrdersLengthForClosedOrders = !this.visibleBuyOrdersLengthForClosedOrders ||
      this.visibleBuyOrdersLengthForClosedOrders > 0 ? 0 : this.visibleBuyOrdersLengthForClosedOrders;
    this.visibleSellOrdersLengthForClosedOrders = !this.visibleSellOrdersLengthForClosedOrders ||
      this.visibleSellOrdersLengthForClosedOrders > 0 ? 0 : this.visibleSellOrdersLengthForClosedOrders;
    this.orders.forEach(item => {
      if (item.orderType === 'buy') {
        this.visibleBuyOrdersLengthForClosedOrders += !item.isOpen ? 1 : 0;
      } else if (item.orderType === 'sell') {
        this.visibleSellOrdersLengthForClosedOrders += !item.isOpen ? 1 : 0;
      }
    });
  }

  countIndexOfTheLastVisibleSellOrderForOrderBook(index: number, order: IOrder): number {
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

  countIndexOfTheLastVisibleSellOrderForClosedOrders(index: number, order: IOrder): number {
    let allSellOrdersHaveIndexProperty = true;
    order.index = index;
    const visibleSellOrders = _.filter(this.orders, {
      isOpen: false,
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

  excludeItemFromList(id: number, type: string, operationType: string): void {
    const itemToExcludeFromList = _.find(this.orders, {id: id, orderType: type});
    itemToExcludeFromList.isOpen = false;
    itemToExcludeFromList.flashAnimation = "animate";
    const index = _.findIndex(this.orders, itemToExcludeFromList);
    if (operationType === 'trade') {
      this.orders[index].isOpen = false;
    } else if (operationType === 'close') {
      this.orders[index].isLocked = true;
    }
    this.closedOrders.unshift(itemToExcludeFromList);
    setTimeout(() => {
      if (type === "sell") {
        this.visibleSellOrdersLengthForOrderBook = this.visibleSellOrdersLengthForOrderBook === 0 ?
          0 : this.visibleSellOrdersLengthForOrderBook - 1;
      } else if (type === "buy") {
        this.visibleBuyOrdersLengthForOrderBook = this.visibleBuyOrdersLengthForOrderBook === 0 ?
          0 : this.visibleBuyOrdersLengthForOrderBook - 1;
      }
    }, 1000);
  }

  calculateFirstVisibleItemIndexForOrderBook(): number {
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

  calculateFirstVisibleItemIndexForClosedOrders(): number {
    let index;
    let flag = true;
    this.closedOrders.forEach((item, i) => {
      if (!item.isOpen && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
  }

  findTheSmallestPriceOfOpenedSellOrders(): void {
    const sellOrders = _.filter(this.orders, {
      orderType: 'sell',
      isOpen: true,
      isLocked: false
    });
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
