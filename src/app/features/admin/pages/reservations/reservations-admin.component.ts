import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { AdminService } from '../../admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Reserva } from '../../../../shared/models/rental/rental.model';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CurrencyPipe, PeruDateTimePipe],
  templateUrl: './reservations-admin.component.html',
  styleUrl: './reservations-admin.component.scss',
})
export class ReservationsAdminComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);

  readonly reservas = signal<Reserva[]>([]);
  readonly loading = signal(false);
  readonly savingId = signal<string | null>(null);
  readonly codigo = signal('');
  readonly dni = signal('');
  readonly nombre = signal('');

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.admin.getReservas({ page: 1, limit: 20 }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (res) => this.reservas.set(res.data ?? []),
      error: (err) => this.notifications.error(err?.error?.message || 'No se pudieron cargar las reservas'),
    });
  }

  buscar(): void {
    const params: Record<string, string> = {};
    if (this.codigo().trim()) params['codigo'] = this.codigo().trim();
    if (this.dni().trim()) params['dni'] = this.dni().trim();
    if (this.nombre().trim()) params['nombre'] = this.nombre().trim();

    if (!Object.keys(params).length) {
      this.load();
      return;
    }

    this.loading.set(true);
    this.admin.buscarReservas(params).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (data) => this.reservas.set(data),
      error: (err) => this.notifications.error(err?.error?.message || 'No se encontraron reservas'),
    });
  }

  confirmar(reserva: Reserva): void {
    this.savingId.set(reserva.id);
    this.admin.confirmarReserva(reserva.id, {
      metodo_pago: 'EFECTIVO',
      transaccion_referencia: 'SUC-' + Date.now(),
    }).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: () => {
        this.notifications.success('Reserva confirmada');
        this.buscar();
      },
      error: (err) => this.notifications.error(err?.error?.message || 'No se pudo confirmar la reserva'),
    });
  }

  pagarSaldo(reserva: Reserva): void {
    this.savingId.set(reserva.id);
    this.admin.pagarSaldoReserva(reserva.id, {
      metodo_pago: 'EFECTIVO',
      transaccion_referencia: 'SALDO-' + Date.now(),
    }).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: () => {
        this.notifications.success('Saldo de reserva pagado');
        this.buscar();
      },
      error: (err) => this.notifications.error(err?.error?.message || 'No se pudo cobrar el saldo'),
    });
  }

  activar(reserva: Reserva): void {
    this.savingId.set(reserva.id);
    this.admin.activarAlquilerReserva(reserva.id).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: () => {
        this.notifications.success('Alquiler activado');
        this.buscar();
      },
      error: (err) => this.notifications.error(err?.error?.message || 'No se pudo activar el alquiler'),
    });
  }

  clienteNombre(reserva: Reserva): string {
    const perfil = reserva.cliente?.perfil;
    if (!perfil) return reserva.cliente?.email ?? 'Cliente';
    return `${perfil.nombres} ${perfil.apellido_paterno} ${perfil.apellido_materno}`.trim();
  }

  fechaInicio(reserva: Reserva): string {
    return reserva.fecha_inicio_programada ?? reserva.fecha_inicio ?? '';
  }

  fechaFin(reserva: Reserva): string {
    return reserva.fecha_fin_programada ?? reserva.fecha_fin ?? '';
  }

  totalReserva(reserva: Reserva): number {
    return Number(reserva.monto_total_estimado ?? reserva.monto_estimado ?? 0);
  }

  totalPagado(reserva: Reserva): number {
    return (reserva.pagos ?? [])
      .filter((p) => p.estado_pago === 'PAGADO' || p.estado_pago === 'CONFIRMADO')
      .reduce((sum, p) => sum + Number(p.monto), 0);
  }

  saldoPendiente(reserva: Reserva): number {
    return Math.max(0, this.totalReserva(reserva) - this.totalPagado(reserva));
  }

  puedeConfirmar(reserva: Reserva): boolean {
    return reserva.estado === 'RESERVADA_TEMPORAL' || reserva.estado === 'PENDIENTE_PAGO_RESERVA';
  }

  puedePagarSaldo(reserva: Reserva): boolean {
    return reserva.estado === 'RESERVADA' || reserva.estado === 'PENDIENTE_PAGO_SALDO';
  }

  puedeActivar(reserva: Reserva): boolean {
    return reserva.estado === 'PAGADA' && !this.alquilerId(reserva);
  }

  alquilerId(reserva: Reserva): string | null {
    return reserva.alquiler?.id ?? reserva.alquileres?.[0]?.id ?? null;
  }
}
