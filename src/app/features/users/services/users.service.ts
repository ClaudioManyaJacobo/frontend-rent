import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
} from '../../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = inject(ApiService);

  findAll(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  findOne(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  create(dto: CreateUserRequest): Observable<User> {
    return this.api.post<User>('/users', dto);
  }

  update(id: string, dto: UpdateUserRequest): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, dto);
  }

  listSucursalAssignments(id: string): Observable<unknown[]> {
    return this.api.get<unknown[]>(`/users/${id}/sucursales`);
  }

  addSucursalAssignment(id: string, sucursal_id: string): Observable<unknown> {
    return this.api.post<unknown>(`/users/${id}/sucursales`, { sucursal_id });
  }

  remove(id: string): Observable<null> {
    return this.api.delete<null>(`/users/${id}`);
  }
}
