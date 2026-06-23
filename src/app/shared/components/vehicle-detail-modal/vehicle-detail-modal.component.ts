import { Component, input, output, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehiculo } from '../../models/vehicle/vehicle.model';

@Component({
  selector: 'app-vehicle-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-detail-modal.component.html',
  styleUrl: './vehicle-detail-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VehicleDetailModalComponent implements OnDestroy {
  vehicle = input.required<Vehiculo>();

  close = output<void>();
  reserve = output<void>();

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }
}
