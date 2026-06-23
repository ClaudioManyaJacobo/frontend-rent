import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

interface ShowcaseFeature {
  icon: string;
  title: string;
  text: string;
}

interface ShowcaseStat {
  value: string;
  label: string;
}

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  readonly features: ShowcaseFeature[] = [
    {
      icon: 'fa-car',
      title: 'Flota diversa',
      text: 'Económico, sedán, SUV y premium para cada ocasión.',
    },
    {
      icon: 'fa-shield',
      title: 'Empresas verificadas',
      text: 'Rentadoras registradas con datos y contacto claros.',
    },
    {
      icon: 'fa-bolt',
      title: 'Acceso rápido',
      text: 'Crea tu cuenta y gestiona reservas en un solo lugar.',
    },
  ];

  readonly stats: ShowcaseStat[] = [
    { value: '120+', label: 'Vehículos' },
    { value: '18+', label: 'Empresas' },
    { value: '4.8★', label: 'Valoración' },
  ];
}
