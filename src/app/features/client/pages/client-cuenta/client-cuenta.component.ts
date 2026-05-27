import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-client-cuenta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-cuenta.component.html',
  styleUrls: ['./client-cuenta.component.scss']
})
export class ClientCuentaComponent {
  readonly auth = inject(AuthService);

  get userName(): string {
    const email = this.auth.currentUser()?.email;
    if (!email) return 'Cliente';
    const parts = email.split('@')[0];
    return parts.charAt(0).toUpperCase() + parts.slice(1);
  }

  get initials(): string {
    const email = this.auth.currentUser()?.email;
    if (!email) return 'CL';
    return email.substring(0, 2).toUpperCase();
  }
}
