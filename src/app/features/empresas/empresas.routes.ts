import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const EMPRESAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/empresa-list/empresa-list.component').then(
        (m) => m.EmpresaListComponent,
      ),
  },
  {
    path: 'new',
    canActivate: [roleGuard(['SUPER_ADMIN'])],
    loadComponent: () =>
      import('./pages/empresa-form/empresa-form.component').then(
        (m) => m.EmpresaFormComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/empresa-form/empresa-form.component').then(
        (m) => m.EmpresaFormComponent,
      ),
  },
];
