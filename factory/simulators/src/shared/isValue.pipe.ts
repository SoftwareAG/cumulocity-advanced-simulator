import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isValue'
})
export class IsValuePipe implements PipeTransform {

  transform(value: string): boolean {
    return value.endsWith('.value');
  }

}
