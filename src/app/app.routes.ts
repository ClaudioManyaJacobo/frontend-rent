import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { clientGuard } from './core/guards/client.guard';
import { roleGuard } from './core/guards/role.guard';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './core/layouts/client-layout/client-layout.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'cliente' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'super-admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN'])],
    loadChildren: () =>
      import('./features/super-admin/super-admin.routes').then((m) => m.SUPER_ADMIN_ROUTES),
  },
  {
    path: 'admin',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: 'empleado',
    component: MainLayoutComponent,
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    loadChildren: () =>
      import('./features/empleado/empleado.routes').then((m) => m.EMPLEADO_ROUTES),
  },
  {
    path: 'cliente',
    component: ClientLayoutComponent,
    canActivate: [clientGuard],
    loadChildren: () =>
      import('./features/client/client.routes').then((m) => m.CLIENT_ROUTES),
  },
  { path: '**', redirectTo: 'cliente' },
];
