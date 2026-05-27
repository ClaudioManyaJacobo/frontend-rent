import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { PaginationResponse } from '../../../shared/models/api-response.model';
import {
  CreateEmpresaRequest,
  Empresa,
  UpdateEmpresaRequest,
} from '../../../shared/models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresasService {
  private readonly api = inject(ApiService);

  findAll(page = 1, limit = 10): Observable<PaginationResponse<Empresa>> {
    return this.api.getPaginated<Empresa>('/empresas', { page, limit });
  }

  /** Empresas sin administrador asignado (1 ADMIN por empresa). */
  findSinAdministrador(): Observable<Empresa[]> {
    return this.api.get<Empresa[]>('/empresas/sin-administrador');
  }

  findOne(id: string): Observable<Empresa> {
    return this.api.get<Empresa>(`/empresas/${id}`);
  }

  create(dto: CreateEmpresaRequest): Observable<Empresa> {
    return this.api.post<Empresa>('/empresas', dto);
  }

  update(id: string, dto: UpdateEmpresaRequest): Observable<Empresa> {
    return this.api.patch<Empresa>(`/empresas/${id}`, dto);
  }

  remove(id: string): Observable<null> {
    return this.api.delete<null>(`/empresas/${id}`);
  }
}
