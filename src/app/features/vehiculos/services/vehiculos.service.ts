import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import {
  CreateVehiculoRequest,
  UpdateVehiculoRequest,
  Vehiculo,
  VehiculosQueryParams,
} from '../../../shared/models/vehiculo.model';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private readonly api = inject(ApiService);

  findAll(
    query: VehiculosQueryParams = {},
  ): Observable<PaginationResponse<Vehiculo>> {
    const params: Record<string, string | number> = {};
    if (query.page) params['page'] = query.page;
    if (query.limit) params['limit'] = query.limit;
    if (query.empresa_id) params['empresa_id'] = query.empresa_id;
    if (query.sucursal_id) params['sucursal_id'] = query.sucursal_id;
    if (query.estado) params['estado'] = query.estado;
    return this.api.getPaginated<Vehiculo>('/vehiculos', params);
  }

  findOne(id: string): Observable<Vehiculo> {
    return this.api.get<Vehiculo>(`/vehiculos/${id}`);
  }

  create(dto: CreateVehiculoRequest): Observable<Vehiculo> {
    return this.api.post<Vehiculo>('/vehiculos', dto);
  }

  update(id: string, dto: UpdateVehiculoRequest): Observable<Vehiculo> {
    return this.api.patch<Vehiculo>(`/vehiculos/${id}`, dto);
  }

  remove(id: string): Observable<null> {
    return this.api.delete<null>(`/vehiculos/${id}`);
  }
}
