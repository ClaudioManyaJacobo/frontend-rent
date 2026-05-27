import { Routes } from '@angular/router';
import { authGuard } from '../../core/auth/auth.guard';

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
  {
    path: 'empresas/:empresaId/sucursales',
    loadComponent: () =>
      import('./pages/client-sucursales/client-sucursales.component').then(
        (m) => m.ClientSucursalesComponent,
      ),
  },
  {
    path: 'sucursales/:sucursalId/vehiculos',
    loadComponent: () =>
      import('./pages/client-vehiculos/client-vehiculos.component').then(
        (m) => m.ClientVehiculosComponent,
      ),
  },
  {
    path: 'mis-alquileres',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/client-alquileres/client-alquileres.component').then(
        (m) => m.ClientAlquileresComponent,
      ),
  },
  {
    path: 'mi-cuenta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/client-cuenta/client-cuenta.component').then(
        (m) => m.ClientCuentaComponent,
      ),
  },
  {
    path: 'ayuda',
    loadComponent: () =>
      import('./pages/client-ayuda/client-ayuda.component').then(
        (m) => m.ClientAyudaComponent,
      ),
  },
];

