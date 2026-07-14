import { Component } from '@angular/core';

@Component({
  selector: 'app-client-footer',
  standalone: true,
  template: \
    <footer class="client-footer">
      <p>&copy; 2026 RentCar. Todos los derechos reservados.</p>
    </footer>
  \,
  styles: \
    .client-footer { text-align: center; padding: 2rem; background: #1e293b; color: #94a3b8; font-size: 0.875rem; }
  \
})
export class ClientFooterComponent {}
