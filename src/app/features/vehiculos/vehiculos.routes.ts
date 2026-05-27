import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/vehiculo-list/vehiculo-list.component').then(
        (m) => m.VehiculoListComponent,
      ),
  },
  {
    path: 'new',
    redirectTo: 'nuevo',
    pathMatch: 'full',
  },
  {
    path: 'nuevo',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form.component').then(
        (m) => m.VehiculoFormComponent,
      ),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/vehiculo-form/vehiculo-form.component').then(
        (m) => m.VehiculoFormComponent,
      ),
  },
];
