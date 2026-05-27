import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import {
  CreateSucursalRequest,
  Sucursal,
  UpdateSucursalRequest,
} from '../../../shared/models/sucursal.model';

@Injectable({ providedIn: 'root' })
export class SucursalesService {
  private readonly api = inject(ApiService);

  findAll(
    page = 1,
    limit = 10,
    empresaId?: string,
  ): Observable<PaginationResponse<Sucursal>> {
    const params: Record<string, string | number> = { page, limit };
    if (empresaId) params['empresa_id'] = empresaId;
    return this.api.getPaginated<Sucursal>('/sucursales', params);
  }

  findOne(id: string): Observable<Sucursal> {
    return this.api.get<Sucursal>(`/sucursales/${id}`);
  }

  create(dto: CreateSucursalRequest): Observable<Sucursal> {
    return this.api.post<Sucursal>('/sucursales', dto);
  }

  update(id: string, dto: UpdateSucursalRequest): Observable<Sucursal> {
    return this.api.patch<Sucursal>(`/sucursales/${id}`, dto);
  }

  remove(id: string): Observable<null> {
    return this.api.delete<null>(`/sucursales/${id}`);
  }
}
