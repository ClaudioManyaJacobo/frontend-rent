import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';
import { MainLayoutComponent } from './core/layout/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './core/layout/client-layout/client-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
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
    ],
  },
  {
    path: 'cliente',
    component: ClientLayoutComponent,
    canActivate: [authGuard, roleGuard(['CLIENTE'])],
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];
