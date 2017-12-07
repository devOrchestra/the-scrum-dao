import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'sortClosedOrdersByIdDescendingPipe'
})
export class SortClosedOrdersByIdDescendingPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.sort((a: any, b: any) => {
      if (a.id >= b.id) {
        return -1;
      } else if (a.id < b.id) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
