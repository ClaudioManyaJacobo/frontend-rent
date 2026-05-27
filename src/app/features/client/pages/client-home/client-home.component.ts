import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
}

interface Stat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './client-home.component.html',
  styleUrl: './client-home.component.scss',
})
export class ClientHomeComponent {
  readonly stats: Stat[] = [
    { value: '120+', label: 'Vehículos disponibles' },
    { value: '18', label: 'Empresas aliadas' },
    { value: '4.8', label: 'Valoración media' },
    { value: '24/7', label: 'Atención al cliente' },
  ];

  readonly highlights: Highlight[] = [
    {
      icon: '🚗',
      title: 'Flota para cada viaje',
      description:
        'Desde compactos urbanos hasta SUVs familiares. Elige el auto ideal para ciudad, carretera o aventura.',
    },
    {
      icon: '📍',
      title: 'Recogida flexible',
      description:
        'Aeropuerto, hotel o sucursal en tu zona. Coordinamos entrega y devolución sin complicaciones.',
    },
    {
      icon: '🛡️',
      title: 'Reserva segura',
      description:
        'Empresas verificadas, contratos claros y seguimiento del alquiler desde el primer día.',
    },
    {
      icon: '⚡',
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
      features: ['Bajo consumo', 'Fácil estacionamiento', 'Ideal 1-2 personas'],
    },
    {
      name: 'Sedán',
      priceFrom: 'S/ 129',
      tag: 'Confort',
      features: ['Maletero amplio', 'A/C dual', 'Viajes interurbanos'],
    },
    {
      name: 'SUV',
      priceFrom: 'S/ 189',
      tag: 'Familia',
      features: ['7 asientos opc.', 'Tracción segura', 'Equipaje extra'],
    },
    {
      name: 'Premium',
      priceFrom: 'S/ 299',
      tag: 'Ejecutivo',
      features: ['Cuero', 'Asistencia premium', 'Eventos y negocios'],
    },
  ];
}
