import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then(
        (m) => m.HomeComponent,
      ),
  },
  {
    path: 'empresas',
    loadComponent: () =>
      import('./pages/companies/companies.component').then(
        (m) => m.CompaniesComponent,
      ),
  },
  {
    path: 'vehiculos',
    loadComponent: () =>
      import('./pages/vehicles-catalog/vehicles-catalog.component').then(
        (m) => m.VehiclesCatalogComponent,
      ),
  },
  {
    path: 'empresas/:empresaId/sucursales',
    loadComponent: () =>
      import('./pages/branches/branches.component').then(
        (m) => m.BranchesComponent,
      ),
  },
  {
    path: 'sucursales/:sucursalId/vehiculos',
    loadComponent: () =>
      import('./pages/vehicles/vehicles.component').then(
        (m) => m.VehiclesComponent,
      ),
  },
  {
    path: 'mis-alquileres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/reservations/reservations.component').then(
        (m) => m.ReservationsComponent,
      ),
  },
  {
    path: 'mi-cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (m) => m.ProfileComponent,
      ),
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('./pages/help/help.component').then(
        (m) => m.HelpComponent,
      ),
  },
];
