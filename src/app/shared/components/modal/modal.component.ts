import { Component, input, output, effect, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnDestroy {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly close = output<void>();

  constructor() {
    effect(() => {
      document.body.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
