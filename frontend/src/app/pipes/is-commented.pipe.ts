import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isCommented',
})
export class IsCommentedPipe implements PipeTransform {
  transform(value): string {
    if (value === 1) {
      return 'Commented';
    } else {
      return 'Uncomment';
    }
  }
}
