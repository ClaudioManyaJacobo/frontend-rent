export const ADMIN_MODULES = [
  { path: 'dashboard', label: 'Dashboard', icon: 'chart-bar', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'users', label: 'Usuarios', icon: 'users', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: 'perfiles', label: 'Perfiles', icon: 'id-card', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'roles', label: 'Roles', icon: 'shield', roles: ['SUPER_ADMIN'] },
  { path: 'empresas', label: 'Empresas', icon: 'building', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'sucursales', label: 'Sucursales', icon: 'map-marker', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'vehiculos', label: 'Vehículos', icon: 'car', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'categorias-vehiculos', label: 'Categorías', icon: 'tag', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
  { path: 'alquileres', label: 'Alquileres', icon: 'file-invoice', roles: ['SUPER_ADMIN', 'ADMIN', 'EMPLEADO'] },
] as const;
