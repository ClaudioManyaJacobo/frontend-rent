import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'empresas',
    children: [
      { path: '', loadComponent: () => import('./pages/companies/companies.component').then(m => m.CompaniesComponent) },
    ],
  },
  {
    path: 'sucursales',
    children: [
      { path: '', loadComponent: () => import('./pages/branches/branches.component').then(m => m.BranchesComponent) },
      { path: 'new', loadComponent: () => import('./pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
    ],
  },
  {
    path: 'empleados',
    children: [
      { path: '', loadComponent: () => import('./pages/employees/empleados-sucursal.component').then(m => m.EmpleadosSucursalComponent) },
      { path: 'new', loadComponent: () => import('./pages/employees/empleado-sucursal-form.component').then(m => m.EmpleadoSucursalFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/employees/empleado-sucursal-form.component').then(m => m.EmpleadoSucursalFormComponent) },
    ],
  },
  {
    path: 'categorias-vehiculos',
    children: [
      { path: '', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'new', loadComponent: () => import('./pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
    ],
  },
  {
    path: 'vehiculos',
    children: [
      { path: '', loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'nuevo', loadComponent: () => import('./pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
      { path: 'new', redirectTo: 'nuevo', pathMatch: 'full' },
      { path: ':id/edit', loadComponent: () => import('./pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
    ],
  },
  {
    path: 'servicios-adicionales',
    loadComponent: () => import('./pages/servicios-adicionales/servicios-adicionales.component').then(m => m.ServiciosAdicionalesComponent),
  },
  {
    path: 'reservas',
    children: [
      { path: '', loadComponent: () => import('./pages/reservations/reservations-admin.component').then(m => m.ReservationsAdminComponent) },
    ],
  },
  {
    path: 'alquileres',
    children: [
      { path: '', loadComponent: () => import('./pages/rentals/rentals.component').then(m => m.RentalsComponent) },
      { path: ':id', loadComponent: () => import('./pages/rentals/rentals-detail.component').then(m => m.AlquilerDetailComponent) },
    ],
  },
  {
    path: 'perfiles',
    children: [
      { path: '', loadComponent: () => import('./pages/profiles/profiles.component').then(m => m.ProfilesComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/profiles/profiles-form.component').then(m => m.PerfilFormComponent) },
    ],
  },
];
