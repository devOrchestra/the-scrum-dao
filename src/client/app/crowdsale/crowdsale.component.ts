import { Component, OnInit } from '@angular/core';
import {CrowdsaleAddOrderDialogComponent} from './crowdsale-add-order-dialog/crowdsale-add-order-dialog.component'
import {CrowdsaleAddBuyOrderErrorDialogComponent} from './crowdsale-add-buy-order-error-dialog/crowdsale-add-buy-order-error-dialog.component'
import {MdDialog} from '@angular/material';
import crowdsale_artifacts from '../../../../build/contracts/Crowdsale.json';
import project_artifacts from '../../../../build/contracts/Project.json';
import {default as contract} from 'truffle-contract'
import {FlashAnimation, ShortEnterAnimation} from '../shared/animations'
import * as _ from 'lodash'

@Component({
  selector: 'app-crowdsale',
  templateUrl: './crowdsale.component.html',
  styleUrls: ['./crowdsale.component.css'],
  animations: [FlashAnimation, ShortEnterAnimation]
})
export class CrowdsaleComponent implements OnInit {
  Crowdsale = contract(crowdsale_artifacts);
  Project = contract(project_artifacts);
  orders: { [key: string]: string | number | boolean }[] = [];
  tokenSymbol: string;
  readyToDisplay = false;
  buyOrdersLength: number;
  sellOrdersLength: number;
  currentOwner: string = web3.eth.accounts[0];

  constructor(
    private dialog: MdDialog
  ) { }

  ngOnInit() {
    const sellOrderPromises = [];
    const buyOrderPromises = [];
    this.Crowdsale.setProvider(web3.currentProvider);
    this.Crowdsale.deployed().then(crowdsaleContractInstance => {
      crowdsaleContractInstance.getSellOrderLength()
        .then(sellOrdersLengthResponse => {
          const sellOrdersLength = parseInt(sellOrdersLengthResponse.toString(), 10);
          this.sellOrdersLength = sellOrdersLength;
          for (let i = 0; i < sellOrdersLength; i++) {
            sellOrderPromises.push(crowdsaleContractInstance.getSellOrder.call(i));
          }
          return Promise.all(sellOrderPromises)
        })
        .then(sellOrders => {
          sellOrders.forEach(item => {
            item = this.formatOrder(item, 'sell');
            this.orders.push(item);
          });
          return crowdsaleContractInstance.getBuyOrderLength();
        })
        .then(buyOrdersLengthResponse => {
          const buyOrdersLength = parseInt(buyOrdersLengthResponse.toString(), 10);
          this.buyOrdersLength = buyOrdersLength;
          for (let i = 0; i < buyOrdersLength; i++) {
            buyOrderPromises.push(crowdsaleContractInstance.getBuyOrder.call(i));
          }
          return Promise.all(buyOrderPromises)
        })
        .then(buyOrders => {
          buyOrders.forEach(item => {
            item = this.formatOrder(item, 'buy');
            this.orders.push(item);
          });
          console.log('ORDERS:', this.orders);
          this.Project.setProvider(web3.currentProvider);
          return this.Project.deployed()
        })
        .then(projectContractInstance => {
          projectContractInstance.symbol().then(res => {
            this.tokenSymbol = res;
            this.readyToDisplay = true;
          });
        })
    })
  }

  openAddOrderDialog(): void {
    const addOrderDialogRef = this.dialog.open(CrowdsaleAddOrderDialogComponent);
    addOrderDialogRef.afterClosed().subscribe(addOrderDialogResult => {
      const theSmallestPriceOfSellOrders = this.findTheSmallestPriceOfSellOrders();
      if (addOrderDialogResult && addOrderDialogResult.type && addOrderDialogResult.type === 'buy') {
        if (addOrderDialogResult.price < theSmallestPriceOfSellOrders) {
          const eth = addOrderDialogResult.eth * 1000000000000000000;
          const price = addOrderDialogResult.price * 1000000000000000000;
          this.Crowdsale.deployed()
            .then(crowdsaleContractInstance => {
              crowdsaleContractInstance.addBuyOrder(price, {gas: 500000, from: web3.eth.accounts[0], value: eth})
                .then(response => {
                  this.getBuyOrderToUpdate(crowdsaleContractInstance, this.buyOrdersLength);
                });
            })
        } else {
          this.dialog.open(CrowdsaleAddBuyOrderErrorDialogComponent, {data: theSmallestPriceOfSellOrders});
        }
      } else if (addOrderDialogResult && addOrderDialogResult.type && addOrderDialogResult.type === 'sell') {
        this.Crowdsale.deployed()
          .then(crowdsaleContractInstance => {
            const price = addOrderDialogResult.price * 1000000000000000000;
            crowdsaleContractInstance.addSellOrder(addOrderDialogResult.value, price, {gas: 500000, from: web3.eth.accounts[0]})
              .then(response => {
                this.getSellOrderToUpdate(crowdsaleContractInstance, this.sellOrdersLength);
              })
          })
      }
    });
  }

  getBuyOrderToUpdate(contractInstance, index) {
    contractInstance.getBuyOrder.call(index)
      .then(buyOrder => {
        if (!buyOrder[0] || buyOrder[0].length === 0) {
          this.getBuyOrderToUpdate(contractInstance, this.buyOrdersLength);
          return;
        } else {
          buyOrder = this.formatOrder(buyOrder, 'buy');
          buyOrder.flashAnimation = "animate";
          this.orders.push(buyOrder);
          this.buyOrdersLength += 1;
        }
      })
  }

  getSellOrderToUpdate(contractInstance, index) {
    contractInstance.getSellOrder.call(index)
      .then(sellOrder => {
        if (!sellOrder[0] || sellOrder[0].length === 0) {
          this.getSellOrderToUpdate(contractInstance, this.sellOrdersLength);
          return;
        } else {
          sellOrder = this.formatOrder(sellOrder, 'sell');
          sellOrder.flashAnimation = "animate";
          this.orders.push(sellOrder);
          this.sellOrdersLength += 1;
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
    this.Crowdsale.deployed()
      .then(crowdsaleContractInstance => {
        crowdsaleContractInstance.buy(id, {gas: 500000, from: web3.eth.accounts[0]})
          .then(buyResponse => {
            this.excludeItemFromList(id, 'sell');
          })
          .catch(err => {
            console.error(err);
          })
      })
  }

  sell(id: number): void {
    console.log(typeof id);
    this.Crowdsale.deployed()
      .then(crowdsaleContractInstance => {
        crowdsaleContractInstance.sell(id, {gas: 500000, from: web3.eth.accounts[0]})
          .then(sellResponse => {
            this.excludeItemFromList(id, 'buy');
          })
          .catch(err => {
            console.error(err);
          })
      })
  }

  lockOrder(e, type: string, id: number): void {
    e.stopPropagation();
    this.Crowdsale.deployed()
      .then(crowdsaleContractInstance => {
        if (type === "sell") {
          crowdsaleContractInstance.lockSellOrder(id, {gas: 500000, from: web3.eth.accounts[0]})
            .then(lockSellOrderResponse => {
              console.log("lockSellOrderResponse", lockSellOrderResponse);
              this.excludeItemFromList(id, 'sell');
            })
            .catch(err => {
              console.error(err);
            })
        } else if (type === "buy") {
          crowdsaleContractInstance.lockBuyOrder(id, {gas: 500000, from: web3.eth.accounts[0]})
            .then(lockBuyOrderResponse => {
              console.log("lockBuyOrderResponse", lockBuyOrderResponse);
              this.excludeItemFromList(id, 'buy');
            })
            .catch(err => {
              console.error(err);
            })
        }
      })
  }

  excludeItemFromList(id, type) {
    const itemToExcludeFromList = _.find(this.orders, {id: id, orderType: type});
    itemToExcludeFromList.flashAnimation = "void";
    itemToExcludeFromList.isOpen = false;
    const index = _.findIndex(this.orders, itemToExcludeFromList);
    this.orders.splice(index, 1);
    if (type === "sell") {
      this.sellOrdersLength -= 1
    }
  }

  parseBigNumber(item: number): number {
    return !parseInt(item.toString(), 10) ? 0 : parseInt(item.toString(), 10);
  }

  findTheSmallestPriceOfSellOrders() {
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

  formatOrder(item, type) {
    for (let i = 1; i <= 3; i++) {
      item[i] = this.parseBigNumber(item[i]);
    }
    item = this.transformOrderToObject(item, type);
    item.price = item.price / 1000000000000000000;
    return item;
  }

  transformOrderToObject(item: string | number | boolean[], orderType): { [key: string]: string | number | boolean } {
    return {
      owner: item[0],
      value: item[1],
      price: item[2],
      id: item[3],
      isOpen: item[4],
      isLocked: item[5],
      orderType: orderType
    }
  }

  styleRow(e): void {
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
