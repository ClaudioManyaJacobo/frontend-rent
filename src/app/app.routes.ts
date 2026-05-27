import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './core/layout/client-layout/client-layout.component';

export const routes: Routes = [
  /** Invitados → portal público; el panel admin exige login más abajo. */
  { path: '', pathMatch: 'full', redirectTo: 'cliente' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  /** Panel operativo: SUPER_ADMIN, ADMIN, EMPLEADO (siempre con sesión). */
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then(
            (m) => m.DASHBOARD_ROUTES,
          ),
      },
      {
        path: 'users',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])],
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'perfiles',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/perfiles/perfiles.routes').then(
            (m) => m.PERFILES_ROUTES,
          ),
      },
      {
        path: 'empresas',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/empresas/empresas.routes').then(
            (m) => m.EMPRESAS_ROUTES,
          ),
      },
      {
        path: 'roles',
        canActivate: [roleGuard(['SUPER_ADMIN'])],
        loadChildren: () =>
          import('./features/roles/roles.routes').then((m) => m.ROLES_ROUTES),
      },
      {
        path: 'sucursales',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/sucursales/sucursales.routes').then(
            (m) => m.SUCURSALES_ROUTES,
          ),
      },
      {
        path: 'categorias-vehiculos',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/categorias-vehiculos/categorias-vehiculos.routes').then(
            (m) => m.CATEGORIAS_VEHICULOS_ROUTES,
          ),
      },
      {
        path: 'vehiculos',
        canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
        loadChildren: () =>
          import('./features/vehiculos/vehiculos.routes').then(
            (m) => m.VEHICULOS_ROUTES,
          ),
      },
    ],
  },
  /** Portal cliente: público (sin authGuard). */
  {
    path: 'cliente',
    component: ClientLayoutComponent,
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  { path: '**', redirectTo: 'cliente' },
];
