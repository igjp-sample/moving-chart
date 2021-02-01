import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'name'
})
export class NamePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    var str = value.replace(/-/g, ' ');
    return decodeURI(str);
  }

}
