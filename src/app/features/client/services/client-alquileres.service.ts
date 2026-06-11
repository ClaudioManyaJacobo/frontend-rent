import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Alquiler, IncidenciaAlquiler, CalificacionAlquiler } from '../../../shared/models/alquiler.model';

@Injectable({ providedIn: 'root' })
export class ClientAlquileresService {
  private readonly api = inject(ApiService);

  findMyReservations(): Observable<Alquiler[]> {
    return this.api.get<Alquiler[]>('/alquileres/mis-reservas');
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
    return this.api.post<IncidenciaAlquiler>('/incidencias', dto);
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
    return this.api.patch<Alquiler>(`/alquileres/${id}/confirmar-pago`, dto);
  }

  anular(id: string, motivo?: string): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/anular`, { motivo });
  }
}
