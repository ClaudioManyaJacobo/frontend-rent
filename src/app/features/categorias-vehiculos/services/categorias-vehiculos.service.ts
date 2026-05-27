import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import {
  CategoriaVehiculo,
  CreateCategoriaVehiculoRequest,
  UpdateCategoriaVehiculoRequest,
} from '../../../shared/models/categoria-vehiculo.model';

@Injectable({ providedIn: 'root' })
export class CategoriasVehiculosService {
  private readonly api = inject(ApiService);

  findAll(
    page = 1,
    limit = 50,
  ): Observable<PaginationResponse<CategoriaVehiculo>> {
    return this.api.getPaginated<CategoriaVehiculo>(
      '/categorias-vehiculos',
      { page, limit },
    );
  }

  findOne(id: string): Observable<CategoriaVehiculo> {
    return this.api.get<CategoriaVehiculo>(`/categorias-vehiculos/${id}`);
  }

  create(dto: CreateCategoriaVehiculoRequest): Observable<CategoriaVehiculo> {
    return this.api.post<CategoriaVehiculo>('/categorias-vehiculos', dto);
  }

  update(
    id: string,
    dto: UpdateCategoriaVehiculoRequest,
  ): Observable<CategoriaVehiculo> {
    return this.api.patch<CategoriaVehiculo>(
      `/categorias-vehiculos/${id}`,
      dto,
    );
  }

  remove(id: string): Observable<null> {
    return this.api.delete<null>(`/categorias-vehiculos/${id}`);
  }
}
