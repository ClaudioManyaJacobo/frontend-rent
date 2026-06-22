import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../admin/admin.service';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';

interface Stat {
  value: string;
  label: string;
  subLabel?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly loadingVehiculos = signal<boolean>(true);
  readonly vehiculosError = signal<string>('');

  readonly stats = signal<Stat[]>([
    { value: '0', label: 'Vehículos disponibles', subLabel: 'Variedad para cada viaje' },
    { value: '0', label: 'Empresas aliadas', subLabel: 'Las mejores del país' },
    { value: '4.8', label: 'Valoración media', subLabel: 'Clientes satisfechos' },
    { value: '24/7', label: 'Atención al cliente', subLabel: 'Siempre listos para ayudarte' },
  ]);

  ngOnInit(): void {
    this.loadAllVehiculos();
  }

  private loadAllVehiculos(): void {
    this.loadingVehiculos.set(true);
    this.admin.getVehicles({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const vehiculosData = res.data || [];
        this.vehiculos.set(vehiculosData);
        this.loadingVehiculos.set(false);
        this.updateStats(vehiculosData);
      },
      error: (err) => {
        console.error('Error al cargar vehículos:', err);
        this.vehiculosError.set('No se pudieron cargar los vehículos disponibles');
        this.loadingVehiculos.set(false);
      }
    });
  }

  private updateStats(vehiculos: Vehiculo[]): void {
    const disponibles = vehiculos.filter(v => v.estado === 'DISPONIBLE').length;
    const empresasUnicas = new Set();
    vehiculos.forEach(v => {
      if (v.sucursal_actual?.empresa?.nombre) {
        empresasUnicas.add(v.sucursal_actual.empresa.nombre);
      }
    });
    this.stats.set([
      { value: `${disponibles}+`, label: 'Vehículos disponibles', subLabel: 'Variedad para cada viaje' },
      { value: `${empresasUnicas.size || 1}`, label: 'Empresas aliadas', subLabel: 'Las mejores del país' },
      { value: '4.8', label: 'Valoración media', subLabel: 'Clientes satisfechos' },
      { value: '24/7', label: 'Atención al cliente', subLabel: 'Siempre listos para ayudarte' },
    ]);
  }

}
