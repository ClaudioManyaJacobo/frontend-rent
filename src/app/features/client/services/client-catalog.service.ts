import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface CatalogoQuery {
  page?: number;
  limit?: number;
  search?: string;
  empresa_id?: string;
  sucursal_id?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientCatalogService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getEmpresas(query?: CatalogoQuery): Observable<any> {
    let params = new HttpParams();
    if (query?.page) params = params.set('page', query.page);
    if (query?.limit) params = params.set('limit', query.limit);
    if (query?.search) params = params.set('search', query.search);
    
    return this.http.get(`${this.apiUrl}/empresas`, { params });
  }

  getSucursales(query?: CatalogoQuery): Observable<any> {
    let params = new HttpParams();
    if (query?.page) params = params.set('page', query.page);
    if (query?.limit) params = params.set('limit', query.limit);
    if (query?.empresa_id) params = params.set('empresa_id', query.empresa_id);
    
    return this.http.get(`${this.apiUrl}/sucursales`, { params });
  }

  getSucursalesByEmpresa(empresaId: string, query?: CatalogoQuery): Observable<any> {
    let params = new HttpParams().set('empresa_id', empresaId);
    if (query?.page) params = params.set('page', query.page);
    if (query?.limit) params = params.set('limit', query.limit);
    
    return this.http.get(`${this.apiUrl}/sucursales`, { params });
  }

  getVehiculosBySucursal(sucursalId: string, query?: CatalogoQuery): Observable<any> {
    let params = new HttpParams()
      .set('sucursal_id', sucursalId)
      .set('estado', 'DISPONIBLE');
    if (query?.page) params = params.set('page', query.page);
    if (query?.limit) params = params.set('limit', query.limit);
    
    return this.http.get(`${this.apiUrl}/vehiculos`, { params });
  }

  getSucursal(sucursalId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/sucursales/${sucursalId}`);
  }

  getServiciosAdicionales(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios-adicionales`);
  }
}
