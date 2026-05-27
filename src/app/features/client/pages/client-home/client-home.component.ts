import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientCatalogService } from '../../services/client-catalog.service';

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

interface VehicleCategory {
  name: string;
  priceFrom: string;
  tag: string;
  features: string[];
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.scss',
})
export class ClientHomeComponent implements OnInit {
  private readonly catalogService = inject(ClientCatalogService);
  private readonly router = inject(Router);

  readonly sucursales = signal<any[]>([]);
  readonly selectedSucursalId = signal<string>('');
  readonly pickUpDate = signal<string>('');
  readonly dropOffDate = signal<string>('');
  readonly stats: Stat[] = [
    { value: '120+', label: 'Vehículos disponibles' },
    { value: '18', label: 'Empresas aliadas' },
    { value: '4.8', label: 'Valoración media' },
    { value: '24/7', label: 'Atención al cliente' },
  ];

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

  readonly categories: VehicleCategory[] = [
    {
      name: 'Económico',
      priceFrom: 'S/ 89',
      tag: 'Ciudad',
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80',
      features: ['Bajo consumo', 'Fácil estacionamiento', 'Ideal 1-2 personas'],
    },
    {
      name: 'Sedán',
      priceFrom: 'S/ 129',
      tag: 'Confort',
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=600&q=80',
      features: ['Maletero amplio', 'A/C dual', 'Viajes interurbanos'],
    },
    {
      name: 'SUV',
      priceFrom: 'S/ 189',
      tag: 'Familia',
      image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80',
      features: ['7 asientos opc.', 'Tracción segura', 'Equipaje extra'],
    },
    {
      name: 'Premium',
      priceFrom: 'S/ 299',
      tag: 'Ejecutivo',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
      features: ['Cuero', 'Asistencia premium', 'Eventos y negocios'],
    },
  ];

  ngOnInit(): void {
    // Cargar todas las sucursales para el widget de búsqueda
    this.catalogService.getSucursales().subscribe({
      next: (res) => {
        this.sucursales.set(res.data || []);
      },
      error: (err) => {
        console.error('Error al cargar sucursales en home:', err);
      }
    });

    // Establecer fechas por defecto
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 3);

    this.pickUpDate.set(tomorrow.toISOString().split('T')[0]);
    this.dropOffDate.set(dayAfterTomorrow.toISOString().split('T')[0]);
  }

  onSearchVehicles(): void {
    const sucursalId = this.selectedSucursalId();
    if (sucursalId) {
      this.router.navigate(['/cliente/sucursales', sucursalId, 'vehiculos']);
    } else {
      // Si no selecciona, ir a empresas para que busque de forma general
      this.router.navigate(['/cliente/empresas']);
    }
  }
}
