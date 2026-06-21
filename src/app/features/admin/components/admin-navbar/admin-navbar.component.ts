import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterModule],
  template: \
    <header class="admin-navbar">
      <span class="brand">Admin Panel</span>
      <div class="spacer"></div>
      <a routerLink="/cliente" class="client-link">Ir al portal cliente</a>
    </header>
  \,
  styles: \
    .admin-navbar { display: flex; align-items: center; padding: 0.75rem 1.5rem; background: #fff; border-bottom: 1px solid #e2e8f0; }
    .brand { font-weight: 700; font-size: 1.1rem; color: #0f172a; }
    .spacer { flex: 1; }
    .client-link { color: #6366f1; text-decoration: none; font-size: 0.875rem; }
  \
})
export class AdminNavbarComponent {}
