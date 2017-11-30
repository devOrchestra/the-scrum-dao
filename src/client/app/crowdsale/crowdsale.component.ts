import { Component, OnInit } from '@angular/core';
import {CrowdsaleAddOrderDialogComponent} from './crowdsale-add-order-dialog/crowdsale-add-order-dialog.component'
import {CrowdsaleAddBuyOrderErrorDialogComponent} from './crowdsale-add-buy-order-error-dialog/crowdsale-add-buy-order-error-dialog.component'
import {MdDialog} from '@angular/material';
import {CrowdsaleService} from '../core/contract-calls/crowdsale.service'
import {ProjectService} from '../core/contract-calls/project.service'
import {OrderService} from '../core/order.service'
import {parseBigNumber, countDecimals, formatOrder, transformOrderToObject} from '../shared/methods'
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
  formatOrder = formatOrder;

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
    private _crowdsaleService: CrowdsaleService,
    private _orderService: OrderService
  ) { }

  ngOnInit() {
    const sellOrderPromises = [];
    const buyOrderPromises = [];
    this._orderService.getOrders().subscribe(ordersFromService => {
      if (ordersFromService) {
        this.orders = ordersFromService;
        this.sellOrdersLength = _.filter(this.orders, order => order.orderType === 'sell').length;
        this.buyOrdersLength = _.filter(this.orders, order => order.orderType === 'buy').length;
        this._projectService.decimals()
          .then(decimalsResponse => {
            this.decimals = this.countDecimals(decimalsResponse);
            return this._projectService.symbol();
          })
          .then(symbolResponse => {
            this.tokenSymbol = symbolResponse;
            this.countVisibleOrdersLength();
            this.readyToDisplay = true;
          })
          .catch(err => {
            console.error('An error occurred on crowdsale.component in "OnInit" block:', err);
          });
      }
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
          buyOrder = this.formatOrder(buyOrder, 'buy', this.decimals);
          buyOrder.value /= this.decimals;
          buyOrder.flashAnimation = "animate";
          this.orders.push(buyOrder);
          this._orderService.setOrders(this.orders);
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
          sellOrder = this.formatOrder(sellOrder, 'sell', this.decimals);
          sellOrder.flashAnimation = "animate";
          this.orders.push(sellOrder);
          this._orderService.setOrders(this.orders);
          this.sellOrdersLength += 1;
          this.countVisibleOrdersLength();
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

  excludeItemFromList(id: number, type: string, operationType: string): void {
    const itemToExcludeFromList = _.find(this.orders, {id: id, orderType: type});
    itemToExcludeFromList.isOpen = false;
    const index = _.findIndex(this.orders, itemToExcludeFromList);
    if (operationType === 'trade') {
      this.orders[index].isOpen = false;
    } else if (operationType === 'close') {
      this.orders[index].isLocked = true;
    }
    this._orderService.setOrders(this.orders);
    setTimeout(() => {
      if (type === "sell") {
        this.visibleSellOrdersLength = this.visibleSellOrdersLength === 0 ? 0 : this.visibleSellOrdersLength - 1;
      } else if (type === "buy") {
        this.visibleBuyOrdersLength = this.visibleBuyOrdersLength === 0 ? 0 : this.visibleBuyOrdersLength - 1;
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
