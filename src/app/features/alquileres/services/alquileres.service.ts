import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import {
  Alquiler, CreateAlquilerRequest, EntregarAlquilerRequest,
  DevolverAlquilerRequest, AlquileresQueryParams,
} from '../../../shared/models/alquiler.model';

@Injectable({ providedIn: 'root' })
export class AlquileresService {
  private readonly api = inject(ApiService);

  findAll(query: AlquileresQueryParams = {}): Observable<PaginationResponse<Alquiler>> {
    const params: Record<string, string | number> = {};
    if (query.page) params['page'] = query.page;
    if (query.limit) params['limit'] = query.limit;
    if (query.estado) params['estado'] = query.estado;
    if (query.cliente_id) params['cliente_id'] = query.cliente_id;
    if (query.vehiculo_id) params['vehiculo_id'] = query.vehiculo_id;
    if (query.sucursal_id) params['sucursal_id'] = query.sucursal_id;
    if (query.fecha_desde) params['fecha_desde'] = query.fecha_desde;
    if (query.fecha_hasta) params['fecha_hasta'] = query.fecha_hasta;
    return this.api.getPaginated<Alquiler>('/alquileres', params);
  }

  findOne(id: string): Observable<Alquiler> {
    return this.api.get<Alquiler>(`/alquileres/${id}`);
  }

  findMyReservations(): Observable<Alquiler[]> {
    return this.api.get<Alquiler[]>('/alquileres/mis-reservas');
  }

  create(dto: CreateAlquilerRequest): Observable<Alquiler> {
    return this.api.post<Alquiler>('/alquileres', dto);
  }

  entregar(id: string, dto: EntregarAlquilerRequest): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/entregar`, dto);
  }

  devolver(id: string, dto: DevolverAlquilerRequest): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/devolver`, dto);
  }

  confirmarPago(id: string, dto: { monto: number; metodo_pago: string; transaccion_referencia?: string }): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/confirmar-pago`, dto);
  }

  pagarSaldo(id: string, dto: { metodo_pago: string; transaccion_referencia?: string }): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/pagar-saldo`, dto);
  }

  completarDevolucion(id: string): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/completar-devolucion`, {});
  }

  anular(id: string, motivo?: string): Observable<Alquiler> {
    return this.api.patch<Alquiler>(`/alquileres/${id}/anular`, { motivo });
  }
}
