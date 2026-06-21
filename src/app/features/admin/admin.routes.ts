import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    loadChildren: () =>
      import('../dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN'])],
    children: [
      { path: '', loadComponent: () => import('./pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'new', loadComponent: () => import('./pages/users/users-form.component').then(m => m.UserFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/users/users-form.component').then(m => m.UserFormComponent) },
    ],
  },
  {
    path: 'perfiles',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/profiles/profiles.component').then(m => m.ProfilesComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/profiles/profiles-form.component').then(m => m.PerfilFormComponent) },
    ],
  },
  {
    path: 'roles',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN'])],
    children: [
      { path: '', loadComponent: () => import('./pages/roles/roles.component').then(m => m.RolesComponent) },
    ],
  },
  {
    path: 'empresas',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/companies/companies.component').then(m => m.CompaniesComponent) },
      { path: 'new', canActivate: [roleGuard(['SUPER_ADMIN'])], loadComponent: () => import('./pages/companies/companies-form.component').then(m => m.EmpresaFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/companies/companies-form.component').then(m => m.EmpresaFormComponent) },
    ],
  },
  {
    path: 'sucursales',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/branches/branches.component').then(m => m.BranchesComponent) },
      { path: 'new', canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])], loadComponent: () => import('./pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
      { path: ':id/edit', canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])], loadComponent: () => import('./pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
    ],
  },
  {
    path: 'categorias-vehiculos',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'new', canActivate: [roleGuard(['SUPER_ADMIN'])], loadComponent: () => import('./pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
      { path: ':id/edit', canActivate: [roleGuard(['SUPER_ADMIN'])], loadComponent: () => import('./pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
    ],
  },
  {
    path: 'vehiculos',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'nuevo', canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])], loadComponent: () => import('./pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
      { path: 'new', redirectTo: 'nuevo', pathMatch: 'full' },
      { path: ':id/edit', canActivate: [roleGuard(['SUPER_ADMIN', 'ADMIN'])], loadComponent: () => import('./pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
    ],
  },
  {
    path: 'alquileres',
    canActivate: [authGuard, roleGuard(['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'])],
    children: [
      { path: '', loadComponent: () => import('./pages/rentals/rentals.component').then(m => m.RentalsComponent) },
      { path: ':id', loadComponent: () => import('./pages/rentals/rentals-detail.component').then(m => m.AlquilerDetailComponent) },
    ],
  },
];
