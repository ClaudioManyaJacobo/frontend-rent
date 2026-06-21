import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { AdminService } from '../../../admin/admin.service';
import { Sucursal } from '../../../../shared/models/admin/branch.model';
import { Vehiculo } from '../../../../shared/models/vehicle/vehicle.model';


interface Highlight {
  icon: string;
  title: string;
  description: string;
}

interface Step {
  number: string;
  title: string;
  description: string;
}

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
  private readonly catalogService = inject(ClientCatalogService);
  private readonly admin = inject(AdminService);
  private readonly router = inject(Router);

  readonly sucursales = signal<Sucursal[]>([]);
  readonly selectedSucursalId = signal<string>('');
  readonly pickUpDate = signal<string>('');
  readonly dropOffDate = signal<string>('');
  
  // Signals para vehículos
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly loadingVehiculos = signal<boolean>(true);
  readonly vehiculosError = signal<string>('');
  
  // Estadísticas calculadas desde datos reales
  readonly stats = signal<Stat[]>([
    { value: '0', label: 'Vehículos disponibles', subLabel: 'Variedad para cada viaje' },
    { value: '0', label: 'Empresas aliadas', subLabel: 'Las mejores del país' },
    { value: '4.8', label: 'Valoración media', subLabel: 'Clientes satisfechos' },
    { value: '24/7', label: 'Atención al cliente', subLabel: 'Siempre listos para ayudarte' },
  ]);

  readonly highlights: Highlight[] = [
    {
      icon: 'car',
      title: 'Flota para cada viaje',
      description:
        'Desde compactos urbanos hasta SUVs familiares. Elige el auto ideal para ciudad, carretera o aventura.',
    },
    {
      icon: 'location',
      title: 'Recogida flexible',
      description:
        'Aeropuerto, hotel o sucursal en tu zona. Coordinamos entrega y devolución sin complicaciones.',
    },
    {
      icon: 'shield',
      title: 'Reserva segura',
      description:
        'Empresas verificadas, contratos claros y seguimiento del alquiler desde el primer día.',
    },
    {
      icon: 'flash',
      title: 'Reserva en minutos',
      description:
        'Compara rentadoras, revisa disponibilidad y confirma tu vehículo con pocos pasos.',
    },
  ];

  readonly steps: Step[] = [
    {
      number: '01',
      title: 'Explora empresas',
      description:
        'Revisa las rentadoras registradas en VRS y sus sucursales disponibles.',
    },
    {
      number: '02',
      title: 'Elige tu vehículo',
      description:
        'Filtra por categoría, precio y características. Próximamente: reserva en línea.',
    },
    {
      number: '03',
      title: 'Recoge y disfruta',
      description:
        'Presenta tu documentación, firma el contrato y sal a rodar con tranquilidad.',
    },
  ];

  ngOnInit(): void {
    // Cargar todas las sucursales para el widget de búsqueda
    this.loadSucursales();
    
    // Cargar todos los vehículos
    this.loadAllVehiculos();

    // Establecer fechas por defecto
    this.setDefaultDates();
  }

  private loadSucursales(): void {
    this.catalogService.getSucursales().subscribe({
      next: (res) => {
        this.sucursales.set(res.data || []);
      },
      error: (err) => {
        console.error('Error al cargar sucursales en home:', err);
      }
    });
  }

  private loadAllVehiculos(): void {
    this.loadingVehiculos.set(true);
    
    // Cargar todos los vehículos (sin filtros, página 1 con límite alto)
    this.admin.getVehicles({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        const vehiculosData = res.data || [];
        this.vehiculos.set(vehiculosData);
        this.loadingVehiculos.set(false);
        
        // Actualizar estadísticas con datos reales
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
    
    // Extraer empresas únicas de los vehículos (si tienen sucursal con empresa)
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

  private setDefaultDates(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

    this.pickUpDate.set(tomorrow.toISOString().split('T')[0]);
    this.dropOffDate.set(dayAfterTomorrow.toISOString().split('T')[0]);
  }

  // Método para obtener vehículos destacados (primeros 8 o los que quieras)
  getFeaturedVehicles(): Vehiculo[] {
    return this.vehiculos().slice(0, 8);
  }

  // Método para obtener vehículos por categoría basado en precio
  getVehiclesByCategory(categoryName: string): Vehiculo[] {
    const lowerCategory = categoryName.toLowerCase();
    return this.vehiculos().filter(v => {
      const precio = v.precio_diario_personalizado || 0;
      if (lowerCategory === 'económico') {
        return precio < 100;
      } else if (lowerCategory === 'sedán') {
        return precio >= 100 && precio < 150;
      } else if (lowerCategory === 'suv') {
        return precio >= 150 && precio < 250;
      } else if (lowerCategory === 'premium') {
        return precio >= 250;
      }
      return false;
    });
  }

  onSearchVehicles(): void {
    const sucursalId = this.selectedSucursalId();
    if (sucursalId) {
      this.router.navigate(['/cliente/sucursales', sucursalId, 'vehiculos']);
    } else {
      this.router.navigate(['/cliente/empresas']);
    }
  }

  viewVehicleDetails(vehiculoId: string): void {
    this.router.navigate(['/cliente/vehiculos', vehiculoId]);
  }
}