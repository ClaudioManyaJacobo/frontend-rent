import { Routes } from '@angular/router';

export const EMPLEADO_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'empresas',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/companies/companies.component').then(m => m.CompaniesComponent) },
    ],
  },
  {
    path: 'sucursales',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/branches/branches.component').then(m => m.BranchesComponent) },
    ],
  },
  {
    path: 'vehiculos',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
    ],
  },
  {
    path: 'perfiles',
    children: [
      { path: ':id/edit', loadComponent: () => import('../admin/pages/profiles/profiles-form.component').then(m => m.PerfilFormComponent) },
    ],
  },
  {
    path: 'buscar-reserva',
    loadComponent: () => import('./pages/buscar-reserva/buscar-reserva.component').then(m => m.BuscarReservaComponent),
  },
  {
    path: 'entrega/:alquilerId',
    loadComponent: () => import('./pages/entrega/entrega.component').then(m => m.EntregaComponent),
  },
  {
    path: 'devolucion/:alquilerId',
    loadComponent: () => import('./pages/devolucion/devolucion.component').then(m => m.DevolucionComponent),
  },
  {
    path: 'liquidacion/:alquilerId',
    loadComponent: () => import('./pages/liquidacion/liquidacion.component').then(m => m.LiquidacionComponent),
  },
];
