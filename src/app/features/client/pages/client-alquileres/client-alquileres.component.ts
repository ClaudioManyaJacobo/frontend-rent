import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClientAlquileresService } from '../../services/client-alquileres.service';
import { Alquiler, ESTADO_LABELS, ESTADO_CLASS } from '../../../../shared/models/alquiler.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-client-alquileres',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, CurrencyPipe, FormsModule],
  templateUrl: './client-alquileres.component.html',
  styleUrls: ['./client-alquileres.component.scss'],
})
export class ClientAlquileresComponent implements OnInit {
  private readonly service = inject(ClientAlquileresService);
  private readonly notifications = inject(NotificationService);

  readonly alquileres = signal<Alquiler[]>([]);
  readonly loading = signal(true);
  readonly selectedAlquiler = signal<Alquiler | null>(null);

  // Incidencia modal
  showIncidenciaModal = signal(false);
  incidenciaTipo = signal('CONSULTA');
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
  }

  load(): void {
    this.loading.set(true);
    this.service.findMyReservations().subscribe({
      next: (data) => {
        this.alquileres.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  selectAlquiler(a: Alquiler): void {
    this.selectedAlquiler.set(a);
  }

  // Incidencia
  abrirIncidencia(a: Alquiler): void {
    this.selectedAlquiler.set(a);
    this.incidenciaTipo.set('CONSULTA');
    this.incidenciaComentario.set('');
    this.incidenciaPrioridad.set('MEDIA');
    this.showIncidenciaModal.set(true);
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
    }).subscribe({
      next: () => {
        this.notifications.success('Incidencia reportada correctamente');
        this.showIncidenciaModal.set(false);
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
  }

  pagarReserva(a: Alquiler): void {
    this.enviando.set(true);
    const monto = a.monto_total * 0.3;
    this.service.confirmarPago(a.id, {
      monto,
      metodo_pago: 'TARJETA_CREDITO',
      transaccion_referencia: 'CLI-' + Date.now(),
    }).subscribe({
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
    this.service.anular(a.id, motivo || undefined).subscribe({
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
    }).subscribe({
      next: () => {
        this.notifications.success('Calificación enviada');
        this.showCalificacionModal.set(false);
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
