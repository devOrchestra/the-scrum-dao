import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'sortContributorsAndHoldersByBalanceDescendingPipe'
})
export class SortContributorsAndHoldersByBalanceDescendingPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.sort((a: any, b: any) => {
      if (a.balance >= b.balance) {
        return -1;
      } else if (a.balance < b.balance) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
