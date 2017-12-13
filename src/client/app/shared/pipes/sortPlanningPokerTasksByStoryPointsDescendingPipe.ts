import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'sortPlanningPokerTasksByStoryPointsDescendingPipe'
})
export class SortPlanningPokerTasksByStoryPointsDescendingPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.sort((a: any, b: any) => {
      if (a.fields.votesSum >= b.fields.votesSum) {
        return -1;
      } else if (a.fields.votesSum < b.fields.votesSum) {
        return 1;
      } else {
        return 0;
      }
    });
  }
}
