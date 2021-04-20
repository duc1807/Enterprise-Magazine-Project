import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: number): unknown {
    if (value === 0) {
      return 'Inactive';
    } else if (value === 1) {
      return 'Active';
    }
  }
}
