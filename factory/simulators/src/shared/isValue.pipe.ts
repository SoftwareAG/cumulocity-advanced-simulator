import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isValue'
})
export class IsValuePipe implements PipeTransform {

  transform(entry: {path: string, type: string, value: string}): boolean {
    return entry.type === 'NUMBER';
  }

}
