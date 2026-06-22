import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { PaginationResponse } from '../../shared/models/api-response.model';
import { User } from '../../shared/models/user/user.model';
import { Perfil } from '../../shared/models/user/profile.model';
import { Role } from '../../shared/models/user/role.model';
import { Empresa } from '../../shared/models/admin/company.model';
import { Sucursal } from '../../shared/models/admin/branch.model';
import { Vehiculo } from '../../shared/models/vehicle/vehicle.model';
import { CategoriaVehiculo } from '../../shared/models/vehicle/category.model';
import { Alquiler, CreateAlquilerRequest } from '../../shared/models/rental/rental.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  getDashboardStats(): Observable<Record<string, unknown>> {
    return this.api.get<Record<string, unknown>>('/admin/stats');
  }

  // ── Users ──
  getUsers(): Observable<User[]> {
    return this.api.get<User[]>('/users');
  }

  getUser(id: string): Observable<User> {
    return this.api.get<User>(`/users/${id}`);
  }

  createUser(payload: Partial<User>): Observable<User> {
    return this.api.post<User>('/users', payload);
  }

  updateUser(id: string, payload: Partial<User>): Observable<User> {
    return this.api.patch<User>(`/users/${id}`, payload);
  }

  deleteUser(id: string): Observable<null> {
    return this.api.delete<null>(`/users/${id}`);
  }

  // ── Profiles ──
  getProfiles(): Observable<Perfil[]> {
    return this.api.get<Perfil[]>('/perfiles');
  }

  getProfile(id: string): Observable<Perfil> {
    return this.api.get<Perfil>(`/perfiles/${id}`);
  }

  updateProfile(id: string, payload: Partial<Perfil>): Observable<Perfil> {
    return this.api.patch<Perfil>(`/perfiles/${id}`, payload);
  }

  // ── Roles ──
  getRoles(): Observable<Role[]> {
    return this.api.get<Role[]>('/roles');
  }

  // ── Companies ──
  getCompanies(page = 1, limit = 10): Observable<PaginationResponse<Empresa>> {
    return this.api.getPaginated<Empresa>('/empresas', { page, limit });
  }

  getCompany(id: string): Observable<Empresa> {
    return this.api.get<Empresa>(`/empresas/${id}`);
  }

  getCompaniesSinAdministrador(): Observable<Empresa[]> {
    return this.api.get<Empresa[]>('/empresas/sin-administrador');
  }

  createCompany(payload: Partial<Empresa>): Observable<Empresa> {
    return this.api.post<Empresa>('/empresas', payload);
  }

  updateCompany(id: string, payload: Partial<Empresa>): Observable<Empresa> {
    return this.api.patch<Empresa>(`/empresas/${id}`, payload);
  }

  deleteCompany(id: string): Observable<null> {
    return this.api.delete<null>(`/empresas/${id}`);
  }

  // ── Branches ──
  getBranches(page = 1, limit = 10, empresaId?: string): Observable<PaginationResponse<Sucursal>> {
    const params: Record<string, string | number | boolean> = { page, limit };
    if (empresaId) params['empresa_id'] = empresaId;
    return this.api.getPaginated<Sucursal>('/sucursales', params);
  }

  getBranch(id: string): Observable<Sucursal> {
    return this.api.get<Sucursal>(`/sucursales/${id}`);
  }

  createBranch(payload: Partial<Sucursal>): Observable<Sucursal> {
    return this.api.post<Sucursal>('/sucursales', payload);
  }

  updateBranch(id: string, payload: Partial<Sucursal>): Observable<Sucursal> {
    return this.api.patch<Sucursal>(`/sucursales/${id}`, payload);
  }

  deleteBranch(id: string): Observable<null> {
    return this.api.delete<null>(`/sucursales/${id}`);
  }

  // ── Vehicles ──
  getVehicles(filters: Record<string, string | number | boolean | undefined> = {}): Observable<PaginationResponse<Vehiculo>> {
    const params: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params[k] = v;
    });
    return this.api.getPaginated<Vehiculo>('/vehiculos', params);
  }

  getVehicle(id: string): Observable<Vehiculo> {
    return this.api.get<Vehiculo>(`/vehiculos/${id}`);
  }

  createVehicle(payload: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.api.post<Vehiculo>('/vehiculos', payload);
  }

  updateVehicle(id: string, payload: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.api.patch<Vehiculo>(`/vehiculos/${id}`, payload);
  }

  deleteVehicle(id: string): Observable<null> {
    return this.api.delete<null>(`/vehiculos/${id}`);
  }

  // ── Categories ──
  getCategories(page = 1, limit = 20): Observable<PaginationResponse<CategoriaVehiculo>> {
    return this.api.getPaginated<CategoriaVehiculo>('/categorias-vehiculos', { page, limit });
  }

  getCategory(id: string): Observable<CategoriaVehiculo> {
    return this.api.get<CategoriaVehiculo>(`/categorias-vehiculos/${id}`);
  }

  createCategory(payload: Partial<CategoriaVehiculo>): Observable<CategoriaVehiculo> {
    return this.api.post<CategoriaVehiculo>('/categorias-vehiculos', payload);
  }

  updateCategory(id: string, payload: Partial<CategoriaVehiculo>): Observable<CategoriaVehiculo> {
    return this.api.patch<CategoriaVehiculo>(`/categorias-vehiculos/${id}`, payload);
  }

  deleteCategory(id: string): Observable<null> {
    return this.api.delete<null>(`/categorias-vehiculos/${id}`);
  }

  // ── Rentals ──
  getRentals(filters: Record<string, string | number | boolean | undefined> = {}): Observable<PaginationResponse<Alquiler>> {
    const params: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params[k] = v;
    });
    return this.api.getPaginated<Alquiler>('/alquileres', params);
  }

  getRental(id: string): Observable<Alquiler> {
    return this.api.get<Alquiler>(`/alquileres/${id}`);
  }

  createRental(payload: CreateAlquilerRequest): Observable<Alquiler> {
    return this.api.post<Alquiler>('/alquileres', payload);
  }

  confirmarPagoRental(id: string, payload: { monto: number; metodo_pago: string; transaccion_referencia?: string }): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/confirmar-pago`, payload);
  }

  pagarSaldoRental(id: string, payload: { metodo_pago: string }): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/pagar-saldo`, payload);
  }

  entregarRental(id: string, payload: { inspeccion: Record<string, unknown> }): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/entregar`, payload);
  }

  devolverRental(id: string, payload: { inspeccion: Record<string, unknown>; danos?: { descripcion: string; costo: number }[] }): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/devolver`, payload);
  }

  completarDevolucionRental(id: string): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/completar-devolucion`, {});
  }

  anularRental(id: string, motivo?: string): Observable<unknown> {
    return this.api.patch<unknown>(`/alquileres/${id}/anular`, { motivo });
  }
}
