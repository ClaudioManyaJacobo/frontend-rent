import { Pipe, PipeTransform } from '@angular/core';
import { formatPeruvianDateTime, formatPeruvianDate } from '../utils/date-utils';

@Pipe({
  name: 'peruDateTime',
  standalone: true,
})
export class PeruDateTimePipe implements PipeTransform {
  transform(value: string | null | undefined, format: 'datetime' | 'date' = 'datetime'): string {
    if (!value) return '';
    return format === 'date' ? formatPeruvianDate(value) : formatPeruvianDateTime(value);
  }
}
