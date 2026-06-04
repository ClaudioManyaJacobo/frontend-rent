import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientCatalogService } from '../../services/client-catalog.service';
import { VehiculosService } from '../../../vehiculos/services/vehiculos.service';
import { Vehiculo } from '../../../../shared/models/vehiculo.model';


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
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.scss',
})
export class ClientHomeComponent implements OnInit {
  private readonly catalogService = inject(ClientCatalogService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly router = inject(Router);

  readonly sucursales = signal<any[]>([]);
  readonly selectedSucursalId = signal<string>('');
  readonly pickUpDate = signal<string>('');
  readonly dropOffDate = signal<string>('');
  
  // Signals para vehículos
  readonly vehiculos = signal<Vehiculo[]>([]);
  readonly loadingVehiculos = signal<boolean>(true);
  readonly vehiculosError = signal<string>('');
  
  // Estadísticas calculadas desde datos reales
  readonly stats = signal<Stat[]>([
    { value: '0', label: 'Vehículos disponibles' },
    { value: '0', label: 'Empresas aliadas' },
    { value: '4.8', label: 'Valoración media' },
    { value: '24/7', label: 'Atención al cliente' },
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
    this.vehiculosService.findAll({ page: 1, limit: 100 }).subscribe({
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
        
        // Cargar vehículos de respaldo (mock) si falla
        this.loadMockVehiculos();
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
      { value: `${disponibles}+`, label: 'Vehículos disponibles' },
      { value: `${empresasUnicas.size || 18}`, label: 'Empresas aliadas' },
      { value: '4.8', label: 'Valoración media' },
      { value: '24/7', label: 'Atención al cliente' },
    ]);
  }

  private loadMockVehiculos(): void {
    // Datos de respaldo con valores correctos según el modelo
    const mockVehiculos: Vehiculo[] = [
      {
        id: '1',
        placa: 'ABC-123',
        marca: 'Toyota',
        modelo: 'Yaris',
        anio: 2023,
        color: 'Blanco',
        kilometraje: 15000,
        transmision: 'MANUAL',  // Corregido: MANUAL en lugar de AUTOMATICO
        combustible: 'GASOLINA',
        capacidad_pasajeros: 5,
        numero_puertas: 4,
        precio_diario_personalizado: 89,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
        categoria_id: '1',
        sucursal_actual_id: '1',
      },
      {
        id: '2',
        placa: 'DEF-456',
        marca: 'Hyundai',
        modelo: 'Accent',
        anio: 2023,
        color: 'Gris',
        kilometraje: 12000,
        transmision: 'AUTOMATICA',  // Corregido: AUTOMATICA en lugar de AUTOMATICO
        combustible: 'GASOLINA',
        capacidad_pasajeros: 5,
        numero_puertas: 4,
        precio_diario_personalizado: 99,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
        categoria_id: '2',
        sucursal_actual_id: '2',
      },
      {
        id: '3',
        placa: 'GHI-789',
        marca: 'Kia',
        modelo: 'Sportage',
        anio: 2023,
        color: 'Negro',
        kilometraje: 8000,
        transmision: 'AUTOMATICA',  // Corregido: AUTOMATICA
        combustible: 'DIESEL',
        capacidad_pasajeros: 5,
        numero_puertas: 5,
        precio_diario_personalizado: 189,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
        categoria_id: '3',
        sucursal_actual_id: '3',
      },
      {
        id: '4',
        placa: 'JKL-012',
        marca: 'Mercedes',
        modelo: 'Clase C',
        anio: 2023,
        color: 'Plata',
        kilometraje: 5000,
        transmision: 'AUTOMATICA',  // Corregido: AUTOMATICA
        combustible: 'GASOLINA',
        capacidad_pasajeros: 5,
        numero_puertas: 4,
        precio_diario_personalizado: 299,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
        categoria_id: '4',
        sucursal_actual_id: '4',
      },
      {
        id: '5',
        placa: 'MNO-345',
        marca: 'Suzuki',
        modelo: 'Swift',
        anio: 2022,
        color: 'Rojo',
        kilometraje: 25000,
        transmision: 'MANUAL',  // Corregido: MANUAL
        combustible: 'GASOLINA',
        capacidad_pasajeros: 5,
        numero_puertas: 4,
        precio_diario_personalizado: 79,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=600&q=80',
        categoria_id: '1',
        sucursal_actual_id: '5',
      },
      {
        id: '6',
        placa: 'PQR-678',
        marca: 'Chevrolet',
        modelo: 'Sail',
        anio: 2022,
        color: 'Azul',
        kilometraje: 30000,
        transmision: 'MANUAL',  // Corregido: MANUAL
        combustible: 'GASOLINA',
        capacidad_pasajeros: 5,
        numero_puertas: 4,
        precio_diario_personalizado: 85,
        estado: 'DISPONIBLE',
        foto_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
        categoria_id: '1',
        sucursal_actual_id: '6',
      },
    ];
    this.vehiculos.set(mockVehiculos);
    this.stats.set([
      { value: '120+', label: 'Vehículos disponibles' },
      { value: '18', label: 'Empresas aliadas' },
      { value: '4.8', label: 'Valoración media' },
      { value: '24/7', label: 'Atención al cliente' },
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