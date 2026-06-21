import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './core/layouts/auth-layout/auth-layout.component';
import { ClientLayoutComponent } from './core/layouts/client-layout/client-layout.component';

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
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
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
