import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Empresa } from '../../shared/models/admin/company.model';
import { Sucursal } from '../../shared/models/admin/branch.model';
import { Vehiculo } from '../../shared/models/vehicle/vehicle.model';
import { Alquiler, CreateAlquilerRequest } from '../../shared/models/rental/rental.model';

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

  createReservation(dto: CreateAlquilerRequest): Observable<Alquiler> {
    return this.api.post<Alquiler>('/alquileres', dto);
  }

  getMyReservations(): Observable<Alquiler[]> {
    return this.api.get<Alquiler[]>('/alquileres/mis-reservas');
  }
}
