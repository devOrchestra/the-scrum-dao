import { Pipe, PipeTransform } from "@angular/core"

@Pipe({
  name: 'sortBacklogTasksByPriorityDescendingPipe'
})
export class SortBacklogTasksByPriorityDescendingPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value.sort((a: any, b: any) => {
      if (!a.fields.votingCount && !a.fields.totalSupply && b.fields.votingCount && b.fields.totalSupply) {
        return 1;
      } else if (!b.fields.votingCount && !b.fields.totalSupply && a.fields.votingCount && a.fields.totalSupply) {
        return -1;
      } else if (!a.fields.votingCount && !a.fields.totalSupply && !b.fields.votingCount && !b.fields.totalSupply) {
        return 0;
      } else if (this.countTotalPercents(a.fields.votingCount, a.fields.totalSupply) >= this.countTotalPercents(b.fields.votingCount, b.fields.totalSupply)) {
        return -1;
      } else if (this.countTotalPercents(a.fields.votingCount, a.fields.totalSupply) < this.countTotalPercents(b.fields.votingCount, b.fields.totalSupply)) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  countTotalPercents(votingCount: number, totalSupply: number): number {
    const result = votingCount / totalSupply * 100;
    if (!result && result !== 0) {
      return 0;
    } else {
      return Number(result.toFixed(1));
    }
  }
}
