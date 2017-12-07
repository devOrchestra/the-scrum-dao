import { Injectable } from '@angular/core';
import { RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { CrowdsaleService } from '../contract-calls/crowdsale.service'
import { ProjectService } from '../contract-calls/project.service'
import { OrderService } from '../order.service'
import { parseBigNumber, countDecimals, formatOrder } from '../../shared/methods'

@Injectable()
export class OrdersResolverService {
  parseBigNumber = parseBigNumber;
  countDecimals = countDecimals;
  formatOrder = formatOrder;

  constructor(
    private _crowdsaleService: CrowdsaleService,
    private _projectService: ProjectService,
    private _orderService: OrderService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): void {
    let sellOrdersLength: number,
        buyOrdersLength: number,
        decimals: number;
    const sellOrderPromises = [],
          buyOrderPromises = [],
          orders = [];
    this._projectService.decimals()
      .then(decimalsResponse => {
        decimals = this.countDecimals(decimalsResponse);
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
          item = this.formatOrder(item, 'sell', decimals);
          item.value /= decimals;
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
          item = this.formatOrder(item, 'buy', decimals);
          item.value /= decimals;
          orders.push(item);
        });
        console.log("resolver", orders);
        this._orderService.setOrders(orders);
      })
      .catch(err => {
        console.error('An error occurred on order-resolver.service:', err);
      });
  }
}
