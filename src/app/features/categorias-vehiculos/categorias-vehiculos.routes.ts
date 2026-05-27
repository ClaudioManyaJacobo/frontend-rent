import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const CATEGORIAS_VEHICULOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/categoria-list/categoria-list.component').then(
        (m) => m.CategoriaListComponent,
      ),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/categoria-form/categoria-form.component').then(
        (m) => m.CategoriaFormComponent,
      ),
  },
  {
    path: ':id/edit',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/categoria-form/categoria-form.component').then(
        (m) => m.CategoriaFormComponent,
      ),
  },
];
