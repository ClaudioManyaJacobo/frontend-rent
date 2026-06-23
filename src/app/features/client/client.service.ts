import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Empresa } from '../../shared/models/admin/company.model';
import { Sucursal } from '../../shared/models/admin/branch.model';
import { Vehiculo } from '../../shared/models/vehicle/vehicle.model';
import {
  CreateReservaRequest,
  Reserva,
} from '../../shared/models/rental/rental.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly api = inject(ApiService);

  getEmpresas(page = 1, limit = 10): Observable<{ data: Empresa[] }> {
    return this.api.get<{ data: Empresa[] }>('/empresas', { page, limit });
  }

  getSucursales(empresaId: number): Observable<{ data: Sucursal[] }> {
    return this.api.get<{ data: Sucursal[] }>(`/sucursales?empresaId=${empresaId}`);
  }

  getVehiculos(params: Record<string, string | number | boolean>): Observable<{ data: Vehiculo[] }> {
    return this.api.get<{ data: Vehiculo[] }>('/vehiculos', params);
  }

  createReservation(dto: CreateReservaRequest): Observable<Reserva> {
    return this.api.post<Reserva>('/reservas', dto);
  }

  getMyReservations(): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas/mis-reservas');
  }
}
