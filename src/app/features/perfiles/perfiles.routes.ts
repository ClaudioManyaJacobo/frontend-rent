import { Routes } from '@angular/router';

export const PERFILES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/perfil-list/perfil-list.component').then(
        (m) => m.PerfilListComponent,
      ),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/perfil-form/perfil-form.component').then(
        (m) => m.PerfilFormComponent,
      ),
  },
];
