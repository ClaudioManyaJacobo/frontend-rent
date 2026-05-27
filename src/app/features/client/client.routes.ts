import { Routes } from '@angular/router';

export const CLIENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/client-home/client-home.component').then(
        (m) => m.ClientHomeComponent,
      ),
  },
  {
    path: 'empresas',
    loadComponent: () =>
      import('./pages/client-empresas/client-empresas.component').then(
        (m) => m.ClientEmpresasComponent,
      ),
  },
];

