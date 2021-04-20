import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'facultyName',
})
export class FacultyNamePipe implements PipeTransform {
  transform(value: number): string {
    if (value === 1) {
      return 'IT';
    } else if (value === 2) {
      return 'Business';
    } else if (value === 3) {
      return 'Marketing';
    } else if (value === 99) {
      return 'All';
    }
  }
}
