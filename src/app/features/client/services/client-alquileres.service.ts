import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  Alquiler,
  IncidenciaAlquiler,
  CalificacionAlquiler,
  Reserva,
} from '../../../shared/models/rental/rental.model';

@Injectable({ providedIn: 'root' })
export class ClientAlquileresService {
  private readonly api = inject(ApiService);

  findMyReservations(): Observable<Alquiler[]> {
    return this.api
      .get<Reserva[]>('/reservas/mis-reservas')
      .pipe(map((reservas) => reservas.map((r) => this.toAlquilerListItem(r))));
  }

  findOne(id: string): Observable<Alquiler> {
    return this.api.get<Alquiler>(`/alquileres/${id}`);
  }

  reportarIncidencia(dto: {
    alquiler_id: string;
    tipo: string;
    comentario: string;
    prioridad?: string;
  }): Observable<IncidenciaAlquiler> {
    return this.api.post<IncidenciaAlquiler>('/incidencias', {
      alquiler_id: dto.alquiler_id,
      tipo: dto.tipo,
      descripcion: dto.comentario,
      prioridad: dto.prioridad,
    });
  }

  calificar(dto: {
    alquiler_id: string;
    cliente_calificacion: number;
    cliente_comentario?: string;
  }): Observable<CalificacionAlquiler> {
    return this.api.post<CalificacionAlquiler>('/calificaciones', dto);
  }

  getCalificacion(alquilerId: string): Observable<CalificacionAlquiler | null> {
    return this.api.get<CalificacionAlquiler | null>(`/calificaciones/alquiler/${alquilerId}`);
  }

  confirmarPago(id: string, dto: {
    monto: number;
    metodo_pago: string;
    transaccion_referencia?: string;
  }): Observable<Alquiler> {
    return this.api
      .patch<Reserva>(`/reservas/${id}/confirmar-pago-reserva`, {
        metodo_pago: dto.metodo_pago,
        transaccion_referencia: dto.transaccion_referencia,
      })
      .pipe(map((reserva) => this.toAlquilerListItem(reserva)));
  }

  anular(id: string, motivo?: string): Observable<Alquiler> {
    return this.api
      .patch<Reserva>(`/reservas/${id}/cancelar`, { motivo })
      .pipe(map((reserva) => this.toAlquilerListItem(reserva)));
  }

  private toAlquilerListItem(reserva: Reserva): Alquiler {
    const alquiler = reserva.alquiler ?? reserva.alquileres?.[0] ?? null;
    if (alquiler) {
      return this.normalizeAlquilerFromReserva(alquiler, reserva);
    }

    const estadoMap: Record<string, Alquiler['estado']> = {
      RESERVADA_TEMPORAL: 'PENDIENTE_PAGO',
      PENDIENTE_PAGO_RESERVA: 'PENDIENTE_PAGO',
      RESERVADA: 'RESERVADO',
      PENDIENTE_PAGO_SALDO: 'RESERVADO',
      PAGADA: 'PENDIENTE_ENTREGA',
      EN_CURSO: 'EN_CURSO',
      PENDIENTE_LIQUIDACION: 'PENDIENTE_LIQUIDACION',
      FINALIZADA: 'FINALIZADO',
      VENCIDA: 'INCUMPLIDO',
      PENDIENTE_CONFIRMACION: 'PENDIENTE_PAGO',
      CONFIRMADA: 'RESERVADO',
      CANCELADA: 'CANCELADO',
      EXPIRADA: 'INCUMPLIDO',
      CONVERTIDA_ALQUILER: 'EN_CURSO',
    };

    return {
      id: reserva.id,
      reserva_id: reserva.id,
      cliente_id: reserva.cliente_id,
      vehiculo_id: reserva.vehiculo_id,
      sucursal_recojo_id: reserva.sucursal_recojo_id,
      sucursal_devolucion_id: reserva.sucursal_devolucion_id,
      fecha_creacion: reserva.fecha_creacion,
      fecha_reserva: reserva.fecha_reserva ?? reserva.fecha_creacion ?? '',
      fecha_inicio_programada: reserva.fecha_inicio_programada ?? reserva.fecha_inicio ?? '',
      fecha_fin_programada: reserva.fecha_fin_programada ?? reserva.fecha_fin ?? '',
      kilometraje_inicial: reserva.vehiculo?.kilometraje ?? 0,
      nivel_combustible_inicial: '1/1',
      tarifa_diaria_aplicada: reserva.tarifa_diaria_aplicada,
      monto_alquiler_base: reserva.monto_alquiler_base,
      monto_servicios_adicionales: reserva.monto_servicios_adicionales,
      monto_impuestos: reserva.monto_impuestos,
      monto_descuento: reserva.monto_descuento,
      monto_total: Number(reserva.monto_total_estimado ?? reserva.monto_estimado ?? 0),
      estado: estadoMap[reserva.estado] ?? 'PENDIENTE_PAGO',
      observaciones: reserva.observaciones,
      cliente: reserva.cliente,
      vehiculo: reserva.vehiculo,
      sucursal_recojo: reserva.sucursal_recojo,
      sucursal_devolucion: reserva.sucursal_devolucion,
      pagos: reserva.pagos,
    };
  }

  private normalizeAlquilerFromReserva(alquiler: Alquiler, reserva: Reserva): Alquiler {
    return {
      ...alquiler,
      reserva,
      cliente_id: reserva.cliente_id,
      vehiculo_id: reserva.vehiculo_id,
      sucursal_recojo_id: reserva.sucursal_recojo_id,
      sucursal_devolucion_id: reserva.sucursal_devolucion_id,
      fecha_reserva: reserva.fecha_reserva ?? reserva.fecha_creacion ?? '',
      fecha_inicio_programada: reserva.fecha_inicio_programada ?? reserva.fecha_inicio ?? '',
      fecha_fin_programada: reserva.fecha_fin_programada ?? reserva.fecha_fin ?? '',
      tarifa_diaria_aplicada: Number(reserva.tarifa_diaria_aplicada ?? 0),
      monto_alquiler_base: Number(reserva.monto_alquiler_base ?? 0),
      monto_servicios_adicionales: Number(reserva.monto_servicios_adicionales ?? 0) + Number(reserva.monto_conductores_adic ?? 0),
      monto_impuestos: Number(reserva.monto_impuestos ?? 0),
      monto_descuento: Number(reserva.monto_descuento ?? 0),
      monto_total: Number(reserva.monto_total_estimado ?? reserva.monto_estimado ?? 0),
      cliente: reserva.cliente,
      vehiculo: reserva.vehiculo,
      sucursal_recojo: reserva.sucursal_recojo,
      sucursal_devolucion: reserva.sucursal_devolucion,
      pagos: reserva.pagos,
    };
  }
}
