import { Routes } from '@angular/router';
import { roleGuard } from '../../core/auth/role.guard';

export const ALQUILERES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/alquileres-list/alquileres-list.component').then(m => m.AlquileresListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/alquiler-detail/alquiler-detail.component').then(m => m.AlquilerDetailComponent),
  },
];
