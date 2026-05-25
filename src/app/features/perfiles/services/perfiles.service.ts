import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Perfil, UpdatePerfilRequest } from '../../../shared/models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilesService {
  private readonly api = inject(ApiService);

  findAll(): Observable<Perfil[]> {
    return this.api.get<Perfil[]>('/perfiles');
  }

  findOne(id: string): Observable<Perfil> {
    return this.api.get<Perfil>(`/perfiles/${id}`);
  }

  update(id: string, dto: UpdatePerfilRequest): Observable<Perfil> {
    return this.api.patch<Perfil>(`/perfiles/${id}`, dto);
  }
}
