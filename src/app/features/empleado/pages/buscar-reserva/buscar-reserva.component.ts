import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AdminService } from '../../../admin/admin.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { Reserva } from '../../../../shared/models/rental/rental.model';

@Component({
  selector: 'app-buscar-reserva',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './buscar-reserva.component.html',
  styleUrl: './buscar-reserva.component.scss',
})
export class BuscarReservaComponent implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly notifications = inject(NotificationService);
  private readonly router = inject(Router);

  readonly reservas = signal<Reserva[]>([]);

  ngOnInit(): void {
    this.buscar();
  }
  readonly loading = signal(false);
  readonly savingId = signal<string | null>(null);
  readonly codigo = signal('');
  readonly dni = signal('');
  readonly nombre = signal('');
  readonly placa = signal('');

  // Payment form state
  readonly payingId = signal<string | null>(null);
  readonly paymentMetodo = signal('EFECTIVO');
  readonly paymentLoading = signal(false);

  // Detail panel
  readonly detailOpenId = signal<string | null>(null);

  buscar(): void {
    const params: Record<string, string> = {};
    if (this.codigo().trim()) params['codigo'] = this.codigo().trim();
    if (this.dni().trim()) params['dni'] = this.dni().trim();
    if (this.nombre().trim()) params['nombre'] = this.nombre().trim();
    if (this.placa().trim()) params['placa'] = this.placa().trim();

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
    this.placa.set('');
    this.buscar();
  }

  toggleDetail(id: string): void {
    this.detailOpenId.update((v) => (v === id ? null : id));
  }

  // ── Payment for PENDIENTE_PAGO_SALDO ──

  openPayment(r: Reserva): void {
    this.payingId.set(r.id);
    this.paymentMetodo.set('EFECTIVO');
  }

  closePayment(): void {
    this.payingId.set(null);
  }

  confirmarPagoSaldo(r: Reserva): void {
    if (!this.paymentMetodo().trim()) return;
    this.paymentLoading.set(true);
    this.admin.pagarSaldoReserva(r.id, { metodo_pago: this.paymentMetodo() }).pipe(
      finalize(() => this.paymentLoading.set(false)),
    ).subscribe({
      next: () => {
        this.notifications.success('Pago registrado correctamente');
        this.closePayment();
        // refresh
        this.buscar();
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al registrar pago'),
    });
  }

  confirmarPagoReserva(r: Reserva): void {
    this.savingId.set(r.id);
    this.admin.confirmarReserva(r.id, {
      metodo_pago: 'EFECTIVO',
      transaccion_referencia: 'RES-' + Date.now(),
    }).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: () => {
        this.notifications.success('Adelanto de reserva registrado');
        this.buscar();
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al confirmar adelanto'),
    });
  }

  // ── Actions ──

  activarAlquiler(reserva: Reserva): void {
    this.savingId.set(reserva.id);
    this.admin.activarAlquilerReserva(reserva.id).pipe(
      finalize(() => this.savingId.set(null)),
    ).subscribe({
      next: (alquiler) => {
        this.notifications.success('Alquiler activado');
        void this.router.navigate(['/empleado/entrega', (alquiler as any).id]);
      },
      error: (err) => this.notifications.error(err?.error?.message || 'Error al activar alquiler'),
    });
  }

  irA(ruta: string, alquilerId: string | undefined): void {
    if (!alquilerId) return;
    void this.router.navigate([`/empleado/${ruta}`, alquilerId]);
  }

  // ── Helpers ──

  getAlquilerId(r: Reserva): string | undefined {
    return r.alquiler?.id ?? r.alquileres?.[0]?.id;
  }

  getAlquilerEstado(r: Reserva): string | undefined {
    return r.alquiler?.estado ?? r.alquileres?.[0]?.estado;
  }

  /** Sum of CONFIRMED payments */
  totalPagado(r: Reserva): number {
    if (!r.pagos) return 0;
    return r.pagos
      .filter((p) => p.estado_pago === 'CONFIRMADO' || p.estado_pago === 'PAGADO')
      .reduce((s, p) => s + Number(p.monto), 0);
  }

  saldoPendiente(r: Reserva): number {
    return Math.max(0, this.totalReserva(r) - this.totalPagado(r));
  }

  totalReserva(r: Reserva): number {
    return Number(r.monto_total_estimado ?? r.monto_estimado ?? 0);
  }

  puedeConfirmarReserva(r: Reserva): boolean {
    return r.estado === 'RESERVADA_TEMPORAL' || r.estado === 'PENDIENTE_PAGO_RESERVA';
  }

  puedePagarSaldo(r: Reserva): boolean {
    return r.estado === 'RESERVADA' || r.estado === 'PENDIENTE_PAGO_SALDO';
  }

  puedeIniciarAlquiler(r: Reserva): boolean {
    return r.estado === 'PAGADA' && !this.getAlquilerId(r);
  }

  puedeIrAEntrega(r: Reserva): boolean {
    // Reserva PAGADA con alquiler en PENDIENTE_ENTREGA
    if (r.estado === 'PAGADA' && this.getAlquilerId(r)) {
      const est = this.getAlquilerEstado(r);
      return est === 'PENDIENTE_ENTREGA';
    }
    return false;
  }

  puedeDevolver(r: Reserva): boolean {
    // El alquiler está en EN_CURSO (vehículo ya fue entregado)
    const est = this.getAlquilerEstado(r);
    return est === 'EN_CURSO' || r.estado === 'EN_CURSO';
  }

  puedeLiquidar(r: Reserva): boolean {
    // El alquiler está en PENDIENTE_DEVOLUCION o PENDIENTE_LIQUIDACION
    const est = this.getAlquilerEstado(r);
    return est === 'PENDIENTE_DEVOLUCION' || est === 'PENDIENTE_LIQUIDACION' || r.estado === 'PENDIENTE_LIQUIDACION';
  }

  clienteNombre(reserva: Reserva): string {
    const perfil = reserva.cliente?.perfil;
    if (!perfil) return reserva.cliente?.email ?? 'Cliente';
    return `${perfil.nombres} ${perfil.apellido_paterno} ${perfil.apellido_materno}`.trim();
  }

  clienteDni(reserva: Reserva): string {
    return reserva.cliente?.perfil?.dni ?? '';
  }
}
