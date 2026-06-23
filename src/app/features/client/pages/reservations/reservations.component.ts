import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ClientAlquileresService } from '../../services/client-alquileres.service';
import { Alquiler, ESTADO_LABELS, ESTADO_CLASS } from '../../../../shared/models/rental/rental.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { formatRemainingTime, formatCountdown, parsePeruvianDateTime } from '../../../../shared/utils/date-utils';
import { PeruDateTimePipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule, PeruDateTimePipe],
  templateUrl: './reservations.component.html',
  styleUrl: './reservations.component.scss',
})
export class ReservationsComponent implements OnInit, OnDestroy {
  private readonly service = inject(ClientAlquileresService);
  private readonly notifications = inject(NotificationService);
  private readonly destroy$ = new Subject<void>();
  private now = signal(Date.now());
  private timerRef: ReturnType<typeof setInterval> | null = null;

  readonly alquileres = signal<Alquiler[]>([]);
  readonly loading = signal(true);
  readonly selectedAlquiler = signal<Alquiler | null>(null);

  // Incidencia modal
  showIncidenciaModal = signal(false);
  incidenciaTipo = signal('OTRO');
  incidenciaComentario = signal('');
  incidenciaPrioridad = signal('MEDIA');
  enviando = signal(false);

  // Calificación modal
  showCalificacionModal = signal(false);
  calificacionPuntaje = signal(5);
  calificacionComentario = signal('');

  readonly ESTADO_LABELS = ESTADO_LABELS;
  readonly ESTADO_CLASS = ESTADO_CLASS;

  ngOnInit(): void {
    this.load();
    this.timerRef = setInterval(() => this.now.set(Date.now()), 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.timerRef) clearInterval(this.timerRef);
  }

  tiempoRestante(fechaFin: string | null | undefined): string {
    this.now();
    if (!fechaFin) return '';
    return formatRemainingTime(fechaFin);
  }

  pickupCountdown(fechaInicio: string | null | undefined): string {
    this.now();
    if (!fechaInicio) return '';
    const target = parsePeruvianDateTime(fechaInicio).getTime();
    if (isNaN(target)) return '';
    const diff = target - Date.now();
    if (diff <= 0) return 'Vencido';
    return formatCountdown(diff);
  }

  load(): void {
    this.loading.set(true);
    this.service.findMyReservations().pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: (data) => this.alquileres.set(Array.isArray(data) ? data : []),
      error: () => this.alquileres.set([]),
    });
  }

  selectAlquiler(a: Alquiler): void {
    this.selectedAlquiler.set(a);
    document.body.style.overflow = 'hidden';
  }

  cerrarDetalle(): void {
    this.selectedAlquiler.set(null);
    document.body.style.overflow = '';
  }

  puedeReportarIncidencia(a: Alquiler): boolean {
    return a.estado === 'EN_CURSO' && a.id !== a.reserva_id;
  }

  // Incidencia
  abrirIncidencia(a: Alquiler): void {
    this.selectedAlquiler.set(a);
    this.incidenciaTipo.set('OTRO');
    this.incidenciaComentario.set('');
    this.incidenciaPrioridad.set('MEDIA');
    this.showIncidenciaModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarIncidencia(): void {
    this.showIncidenciaModal.set(false);
    document.body.style.overflow = '';
  }

  enviarIncidencia(): void {
    const a = this.selectedAlquiler();
    if (!a || !this.incidenciaComentario()) return;
    this.enviando.set(true);
    this.service.reportarIncidencia({
      alquiler_id: a.id,
      tipo: this.incidenciaTipo(),
      comentario: this.incidenciaComentario(),
      prioridad: this.incidenciaPrioridad(),
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.notifications.success('Incidencia reportada correctamente');
        this.cerrarIncidencia();
        this.enviando.set(false);
        this.load();
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al reportar incidencia');
        this.enviando.set(false);
      },
    });
  }

  // Calificación
  abrirCalificacion(a: Alquiler): void {
    this.selectedAlquiler.set(a);
    this.calificacionPuntaje.set(5);
    this.calificacionComentario.set('');
    this.showCalificacionModal.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarCalificacion(): void {
    this.showCalificacionModal.set(false);
    document.body.style.overflow = '';
  }

  pagarReserva(a: Alquiler): void {
    this.enviando.set(true);
    const monto = a.monto_total * 0.3;
    this.service.confirmarPago(a.id, {
      monto,
      metodo_pago: 'TARJETA_CREDITO',
      transaccion_referencia: 'CLI-' + Date.now(),
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.notifications.success('Pago de reserva confirmado. Vehículo reservado.');
        this.enviando.set(false);
        this.load();
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al procesar pago');
        this.enviando.set(false);
      },
    });
  }

  anularReserva(a: Alquiler): void {
    const motivo = prompt('Motivo de cancelación:');
    if (motivo === null) return;
    this.enviando.set(true);
    this.service.anular(a.id, motivo || undefined).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.notifications.success('Reserva cancelada');
        this.enviando.set(false);
        this.load();
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al cancelar');
        this.enviando.set(false);
      },
    });
  }

  parseNum(v: any): number {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  enviarCalificacion(): void {
    const a = this.selectedAlquiler();
    if (!a) return;
    this.enviando.set(true);
    this.service.calificar({
      alquiler_id: a.id,
      cliente_calificacion: this.calificacionPuntaje(),
      cliente_comentario: this.calificacionComentario() || undefined,
    }).pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: () => {
        this.notifications.success('Calificación enviada');
        this.cerrarCalificacion();
        this.enviando.set(false);
        this.load();
      },
      error: (err) => {
        this.notifications.error(err?.error?.message || 'Error al calificar');
        this.enviando.set(false);
      },
    });
  }
}
