import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const SUCURSALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sucursal-list/sucursal-list.component').then(
        (m) => m.SucursalListComponent,
      ),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/sucursal-form/sucursal-form.component').then(
        (m) => m.SucursalFormComponent,
      ),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadComponent: () =>
      import('./pages/sucursal-form/sucursal-form.component').then(
        (m) => m.SucursalFormComponent,
      ),
  },
];
