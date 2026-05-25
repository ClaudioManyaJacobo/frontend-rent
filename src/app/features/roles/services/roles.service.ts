import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { Role } from '../../../shared/models/role.model';

@Injectable({ providedIn: 'root' })
export class RolesService {
  private readonly api = inject(ApiService);

  findAll(): Observable<Role[]> {
    return this.api.get<Role[]>('/roles');
  }
}
