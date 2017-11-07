import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'sortBuyAndSellOrdersByTypeAndPriceDescendingPipe',
  pure: false
})
export class SortBuyAndSellOrdersByTypeAndPriceDescendingPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.sort((a: any, b: any) => {
      if (a.orderType === 'buy' && b.orderType === 'buy') {
        return this.sortItems(a, b);
      } else if (a.orderType === 'sell' && b.orderType === 'sell') {
        return this.sortItems(a, b);
      } else if (a.orderType === 'sell' && b.orderType === 'buy') {
        return -1;
      } else if (a.orderType === 'buy' && b.orderType === 'sell') {
        return 1;
      }
    });
  }

  sortItems(a, b) {
    if (a.price > b.price) {
      return -1;
    } else if (a.price < b.price) {
      return 1;
    } else if (a.price === b.price) {
      if (a.value > b.value) {
        return -1;
      } else if (a.value < b.value) {
        return 1;
      } else if (a.value === b.value) {
        return 0;
      }
    }
  }
}
