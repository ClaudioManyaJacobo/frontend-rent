import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent<T extends Record<string, unknown>> {
  readonly data = input.required<T[]>();
  readonly columns = input.required<{ key: string; label: string }[]>();
  readonly loading = input(false);
  readonly page = input(1);
  readonly totalPages = input(1);
  readonly pageChanged = output<number>();
}
