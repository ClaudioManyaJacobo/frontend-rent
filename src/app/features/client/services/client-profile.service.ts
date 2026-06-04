import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Perfil, UpdatePerfilRequest } from '../../../shared/models/perfil.model';

@Injectable({ providedIn: 'root' })
export class ClientProfileService {
  private readonly api = inject(ApiService);

  getMyProfile(): Observable<Perfil> {
    return this.api.get<Perfil>('/perfiles/me');
  }

  updateProfile(id: string, dto: UpdatePerfilRequest): Observable<Perfil> {
    return this.api.patch<Perfil>(`/perfiles/${id}`, dto);
  }
}
