import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-client-header',
  standalone: true,
  imports: [RouterModule],
  template: \
    <header class="client-header">
      <a routerLink="/cliente" class="logo">RentCar</a>
      <nav class="nav-links">
        <a routerLink="/cliente/empresas">Empresas</a>
        <a routerLink="/cliente/mis-alquileres">Mis Alquileres</a>
        <a routerLink="/cliente/mi-cuenta">Mi Cuenta</a>
        <a routerLink="/cliente/ayuda">Ayuda</a>
      </nav>
    </header>
  \,
  styles: \
    .client-header { display: flex; align-items: center; padding: 1rem 2rem; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-weight: 800; font-size: 1.5rem; color: #6366f1; text-decoration: none; }
    .nav-links { margin-left: auto; display: flex; gap: 1.5rem; }
    .nav-links a { color: #475569; text-decoration: none; font-weight: 500; }
    .nav-links a:hover { color: #6366f1; }
  \
})
export class ClientHeaderComponent {}
