import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleName',
})
export class RoleNamePipe implements PipeTransform {
  transform(value: number): string {
    if (value === 1) {
      return 'Student';
    } else if (value === 2) {
      return 'Coordinator';
    } else if (value === 3) {
      return 'Manager';
    }
  }
}
