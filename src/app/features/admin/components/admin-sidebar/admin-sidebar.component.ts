import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule],
  template: \
    <nav class="admin-sidebar">
      <ul>
        <li><a routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
        <li><a routerLink="/users" routerLinkActive="active">Usuarios</a></li>
        <li><a routerLink="/perfiles" routerLinkActive="active">Perfiles</a></li>
        <li><a routerLink="/roles" routerLinkActive="active">Roles</a></li>
        <li><a routerLink="/empresas" routerLinkActive="active">Empresas</a></li>
        <li><a routerLink="/sucursales" routerLinkActive="active">Sucursales</a></li>
        <li><a routerLink="/vehiculos" routerLinkActive="active">Vehículos</a></li>
        <li><a routerLink="/categorias-vehiculos" routerLinkActive="active">Categorías</a></li>
        <li><a routerLink="/alquileres" routerLinkActive="active">Alquileres</a></li>
      </ul>
    </nav>
  \,
  styles: \
    .admin-sidebar { width: 240px; background: #1e293b; color: #fff; padding: 1rem; min-height: 100vh; }
    .admin-sidebar ul { list-style: none; padding: 0; margin: 0; }
    .admin-sidebar li { margin: 0.25rem 0; }
    .admin-sidebar a { color: #94a3b8; text-decoration: none; display: block; padding: 0.5rem 0.75rem; border-radius: 6px; }
    .admin-sidebar a:hover, .admin-sidebar a.active { background: #334155; color: #fff; }
  \
})
export class AdminSidebarComponent {}
