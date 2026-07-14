import { Component, input, output } from '@angular/core';

export interface VehicleCardData {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  precio_diario_personalizado: number | null;
  foto_url: string | null;
  placa: string;
}

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  template: \
    <div class="vehicle-card" (click)="onSelect()">
      <img [src]="vehicle().foto_url || 'assets/images/car-placeholder.svg'" [alt]="vehicle().marca + ' ' + vehicle().modelo" class="vehicle-image" />
      <div class="vehicle-info">
        <h3>{{ vehicle().marca }} {{ vehicle().modelo }}</h3>
        <p class="placa">{{ vehicle().placa }}</p>
        <p class="precio">S/ {{ vehicle().precio_diario_personalizado || '—' }}/día</p>
      </div>
    </div>
  \,
  styles: \
    .vehicle-card { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; background: #fff; }
    .vehicle-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .vehicle-image { width: 100%; height: 160px; object-fit: cover; }
    .vehicle-info { padding: 0.75rem; }
    .vehicle-info h3 { margin: 0 0 0.25rem; font-size: 1rem; }
    .placa { color: #64748b; font-size: 0.875rem; margin: 0 0 0.5rem; }
    .precio { font-weight: 700; color: #6366f1; margin: 0; }
  \
})
export class VehicleCardComponent {
  readonly vehicle = input.required<VehicleCardData>();
  readonly select = output<string>();

  onSelect(): void {
    this.select.emit(this.vehicle().id);
  }
}
