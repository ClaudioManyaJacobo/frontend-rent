import { Routes } from '@angular/router';

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
