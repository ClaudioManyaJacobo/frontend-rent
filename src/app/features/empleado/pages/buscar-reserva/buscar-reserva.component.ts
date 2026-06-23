import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Reserva } from '../../../../shared/models/rental/rental.model';

@Component({
  selector: 'app-buscar-reserva',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './buscar-reserva.component.html',
  styleUrl: './buscar-reserva.component.scss',
})
export class BuscarReservaComponent {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly reservas = signal<Reserva[]>([]);
  readonly loading = signal(false);
  readonly savingId = signal<string | null>(null);
  readonly codigo = signal('');
  readonly dni = signal('');
  readonly nombre = signal('');

  buscar(): void {
    const params: Record<string, string> = {};
    if (this.codigo().trim()) params['codigo'] = this.codigo().trim();
    if (this.dni().trim()) params['dni'] = this.dni().trim();
    if (this.nombre().trim()) params['nombre'] = this.nombre().trim();

    if (!Object.keys(params).length) return;

    this.loading.set(true);
    this.admin.buscarReservas(params).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (data) => this.reservas.set(data),
      error: () => this.notifications.error('No se encontraron reservas'),
    });
  }

  limpiar(): void {
    this.codigo.set('');
    this.dni.set('');
    this.nombre.set('');
    this.reservas.set([]);
  }

  activarAlquiler(reserva: Reserva): void {
    this.savingId.set(reserva.id);
    this.admin.activarAlquilerReserva(reserva.id).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: (alquiler) => {
        this.notifications.success('Alquiler activado');
        void this.router.navigate(['/empleado/entrega', alquiler.id]);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al activar alquiler'),
    });
  }

  clienteNombre(reserva: Reserva): string {
    const perfil = reserva.cliente?.perfil;
    if (!perfil) return reserva.cliente?.email ?? 'Cliente';
    return `${perfil.nombres} ${perfil.apellido_paterno} ${perfil.apellido_materno}`.trim();
  }

  irA(ruta: string, alquilerId: string | undefined): void {
    if (!alquilerId) return;
    void this.router.navigate([`/empleado/${ruta}`, alquilerId]);
  }

  getAlquilerId(r: Reserva): string | undefined {
    return r.alquiler?.id ?? r.alquileres?.[0]?.id;
  }
}
