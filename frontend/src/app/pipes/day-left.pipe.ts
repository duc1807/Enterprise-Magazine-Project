import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dayLeft',
})
export class DayLeftPipe implements PipeTransform {
  transform(value: number): number {
    value = value / 1000;
    let daysLeft;
    let now: any = Math.floor(Date.now() / 1000);
    let compare;
    if (value < now) {
      daysLeft = 0;
    } else {
      compare = Math.abs(value - now);
      daysLeft = compare / ( 3600 * 24);
    }
    return daysLeft;
  }
}
