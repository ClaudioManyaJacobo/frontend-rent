import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import { Empresa } from '../../../shared/models/admin/company.model';
import { Sucursal } from '../../../shared/models/admin/branch.model';
import { Vehiculo } from '../../../shared/models/vehicle/vehicle.model';

export interface CatalogoQuery {
  page?: number;
  limit?: number;
  search?: string;
  empresa_id?: string;
  sucursal_id?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientCatalogService {
  private readonly api = inject(ApiService);

  getEmpresas(query?: CatalogoQuery): Observable<PaginationResponse<Empresa>> {
    return this.api.getPaginated<Empresa>('/empresas', query as Record<string, string | number | boolean>);
  }

  getSucursales(query?: CatalogoQuery): Observable<PaginationResponse<Sucursal>> {
    return this.api.getPaginated<Sucursal>('/sucursales', query as Record<string, string | number | boolean>);
  }

  getSucursalesByEmpresa(empresaId: string, query?: CatalogoQuery): Observable<PaginationResponse<Sucursal>> {
    return this.api.getPaginated<Sucursal>('/sucursales', {
      empresa_id: empresaId,
      ...(query as Record<string, string | number | boolean>),
    });
  }

  getVehiculosBySucursal(sucursalId: string, query?: CatalogoQuery): Observable<PaginationResponse<Vehiculo>> {
    return this.api.getPaginated<Vehiculo>('/vehiculos', {
      sucursal_id: sucursalId,
      estado: 'DISPONIBLE',
      ...(query as Record<string, string | number | boolean>),
    });
  }

  getSucursal(sucursalId: string): Observable<Sucursal> {
    return this.api.get<Sucursal>(`/sucursales/${sucursalId}`);
  }

  getServiciosAdicionales(): Observable<any[]> {
    return this.api.get<any[]>('/servicios-adicionales');
  }
}
