import { Pipe, PipeTransform } from '@angular/core';


@Pipe({ name: 'uniqueId' })
export class UniqueIdPipe implements PipeTransform {
  transform<T>(items: T[], key: keyof T): T[] {
    if (!items || !key) return items;
    const seen = new Set();
    return items.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  }
}
