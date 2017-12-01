import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import {ProjectService} from '../core/contract-calls/project.service'
import {OrderService} from '../core/order.service'
import {parseBigNumber, countDecimals} from '../shared/methods'
import {IOrder} from "../shared/interfaces";
import {ControlFlashAnimation, ShortEnterAnimation} from '../shared/animations'
import * as _ from 'lodash'

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css'],
  animations: [ControlFlashAnimation, ShortEnterAnimation]
})
export class ExchangeComponent implements OnInit {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;

  orders: IOrder[] = [];
  tokenSymbol: string;
  readyToDisplay = false;
  decimals: number;
  visibleBuyOrdersLength = 0;
  visibleSellOrdersLength = 0;
  buyOrdersLength: number;
  sellOrdersLength: number;
  maxIndexOfVisibleSellOrders: number;

  constructor(
    private _titleService: Title,
    private _projectService: ProjectService,
    private _orderService: OrderService
  ) { this._titleService.setTitle('Scrum DAO - Exchange'); }

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
    return !order.isOpen;
  }

  countIndexOfTheLastVisibleSellOrder(index: number, order: IOrder): number {
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

  calculateFirstVisibleItemIndex(): number {
    let index;
    let flag = true;
    this.orders.forEach((item, i) => {
      if (!item.isOpen && flag) {
        index = i;
        flag = !flag;
      }
    });
    return index;
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
