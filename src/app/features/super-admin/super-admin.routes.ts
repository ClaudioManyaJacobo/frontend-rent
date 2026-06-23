import { Routes } from '@angular/router';

export const SUPER_ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () =>
      import('../dashboard/pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'empresas',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/companies/companies.component').then(m => m.CompaniesComponent) },
      { path: 'new', loadComponent: () => import('../admin/pages/companies/companies-form.component').then(m => m.EmpresaFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/companies/companies-form.component').then(m => m.EmpresaFormComponent) },
    ],
  },
  {
    path: 'roles',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/roles/roles.component').then(m => m.RolesComponent) },
      { path: ':rolId/permisos', loadComponent: () => import('./pages/roles/role-permisos.component').then(m => m.RolePermisosComponent) },
    ],
  },
  {
    path: 'modulos',
    children: [
      { path: '', loadComponent: () => import('./pages/modulos/modulos.component').then(m => m.ModulosComponent) },
      { path: 'new', loadComponent: () => import('./pages/modulos/modulo-form.component').then(m => m.ModuloFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/modulos/modulo-form.component').then(m => m.ModuloFormComponent) },
    ],
  },
  {
    path: 'permisos',
    children: [
      { path: '', loadComponent: () => import('./pages/permisos/permisos.component').then(m => m.PermisosComponent) },
      { path: 'new', loadComponent: () => import('./pages/permisos/permiso-form.component').then(m => m.PermisoFormComponent) },
      { path: ':id/edit', loadComponent: () => import('./pages/permisos/permiso-form.component').then(m => m.PermisoFormComponent) },
    ],
  },
  {
    path: 'usuarios',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/users/users.component').then(m => m.UsersComponent) },
      { path: 'new', loadComponent: () => import('../admin/pages/users/users-form.component').then(m => m.UserFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/users/users-form.component').then(m => m.UserFormComponent) },
    ],
  },
  {
    path: 'sucursales',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/branches/branches.component').then(m => m.BranchesComponent) },
      { path: 'new', loadComponent: () => import('../admin/pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/branches/branches-form.component').then(m => m.SucursalFormComponent) },
    ],
  },
  {
    path: 'empleados',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/employees/empleados-sucursal.component').then(m => m.EmpleadosSucursalComponent) },
      { path: 'new', loadComponent: () => import('../admin/pages/employees/empleado-sucursal-form.component').then(m => m.EmpleadoSucursalFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/employees/empleado-sucursal-form.component').then(m => m.EmpleadoSucursalFormComponent) },
    ],
  },
  {
    path: 'servicios-adicionales',
    loadComponent: () => import('../admin/pages/servicios-adicionales/servicios-adicionales.component').then(m => m.ServiciosAdicionalesComponent),
  },
  {
    path: 'categorias-vehiculos',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/categories/categories.component').then(m => m.CategoriesComponent) },
      { path: 'new', loadComponent: () => import('../admin/pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/categories/categories-form.component').then(m => m.CategoriaFormComponent) },
    ],
  },
  {
    path: 'vehiculos',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'nuevo', loadComponent: () => import('../admin/pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/vehicles/vehicles-form.component').then(m => m.VehiculoFormComponent) },
    ],
  },
  {
    path: 'reservas',
    loadComponent: () => import('../admin/pages/reservations/reservations-admin.component').then(m => m.ReservationsAdminComponent),
  },
  {
    path: 'alquileres',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/rentals/rentals.component').then(m => m.RentalsComponent) },
      { path: ':id', loadComponent: () => import('../admin/pages/rentals/rentals-detail.component').then(m => m.AlquilerDetailComponent) },
    ],
  },
  {
    path: 'perfiles',
    children: [
      { path: '', loadComponent: () => import('../admin/pages/profiles/profiles.component').then(m => m.ProfilesComponent) },
      { path: ':id/edit', loadComponent: () => import('../admin/pages/profiles/profiles-form.component').then(m => m.PerfilFormComponent) },
    ],
  },
];
