import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '../../core/services/api.service';
import { PaginationResponse } from '../../shared/models/api-response.model';
import { User } from '../../shared/models/user/user.model';
import { Perfil } from '../../shared/models/user/profile.model';
import { Role } from '../../shared/models/user/role.model';
import { Empresa } from '../../shared/models/admin/company.model';
import { Sucursal } from '../../shared/models/admin/branch.model';
import { Vehiculo } from '../../shared/models/vehicle/vehicle.model';
import { CategoriaVehiculo } from '../../shared/models/vehicle/category.model';
import { Modulo, CreateModuloRequest, UpdateModuloRequest } from '../../shared/models/modulo.model';
import { Permiso, CreatePermisoRequest } from '../../shared/models/permiso.model';
import { ServicioAdicional, CreateServicioAdicionalRequest, UpdateServicioAdicionalRequest } from '../../shared/models/servicio-adicional.model';
import { EmpleadoSucursal } from '../../shared/models/empleado-sucursal.model';
import {
  Alquiler,
  CargoAdicionalRequest,
  CargoAdicionalResponse,
  ContratoAlquilerRequest,
  CreateAlquilerRequest,
  DevolverAlquilerOperativoRequest,
  DevolucionOperativaRequest,
  EntregarAlquilerOperativoRequest,
  EntregaOperativaRequest,
  LiquidacionFinalResponse,
  LiquidacionRequest,
  Pago,
  ReporteDevolucion,
  Reserva,
} from '../../shared/models/rental/rental.model';

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

  getRolePermisos(rolId: string): Observable<Permiso[]> {
    return this.api.get<Permiso[]>(`/roles/${rolId}/permisos`);
  }

  addPermisoToRole(rolId: string, permisoId: string): Observable<unknown> {
    return this.api.post<unknown>(`/roles/${rolId}/permisos`, { permiso_id: permisoId });
  }

  removePermisoFromRole(rolId: string, permisoId: string): Observable<unknown> {
    return this.api.delete<unknown>(`/roles/${rolId}/permisos/${permisoId}`);
  }

  // ── Modulos ──
  getModulos(): Observable<Modulo[]> {
    return this.api.get<Modulo[]>('/modulos');
  }

  getModulo(id: string): Observable<Modulo> {
    return this.api.get<Modulo>(`/modulos/${id}`);
  }

  createModulo(payload: CreateModuloRequest): Observable<Modulo> {
    return this.api.post<Modulo>('/modulos', payload);
  }

  updateModulo(id: string, payload: UpdateModuloRequest): Observable<Modulo> {
    return this.api.patch<Modulo>(`/modulos/${id}`, payload);
  }

  deleteModulo(id: string): Observable<null> {
    return this.api.delete<null>(`/modulos/${id}`);
  }

  // ── Permisos ──
  getPermisos(): Observable<Permiso[]> {
    return this.api.get<Permiso[]>('/permisos');
  }

  getPermiso(id: string): Observable<Permiso> {
    return this.api.get<Permiso>(`/permisos/${id}`);
  }

  createPermiso(payload: CreatePermisoRequest): Observable<Permiso> {
    return this.api.post<Permiso>('/permisos', payload);
  }

  updatePermiso(id: string, payload: Partial<CreatePermisoRequest>): Observable<Permiso> {
    return this.api.patch<Permiso>(`/permisos/${id}`, payload);
  }

  deletePermiso(id: string): Observable<null> {
    return this.api.delete<null>(`/permisos/${id}`);
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


  // ── Servicios Adicionales ──
  getServiciosAdicionales(page = 1, limit = 50): Observable<PaginationResponse<ServicioAdicional>> {
    return this.api.getPaginated<ServicioAdicional>('/servicios-adicionales', { page, limit });
  }

  getServicioAdicional(id: string): Observable<ServicioAdicional> {
    return this.api.get<ServicioAdicional>(`/servicios-adicionales/${id}`);
  }

  createServicioAdicional(payload: CreateServicioAdicionalRequest): Observable<ServicioAdicional> {
    return this.api.post<ServicioAdicional>('/servicios-adicionales', payload);
  }

  updateServicioAdicional(id: string, payload: UpdateServicioAdicionalRequest): Observable<ServicioAdicional> {
    return this.api.patch<ServicioAdicional>(`/servicios-adicionales/${id}`, payload);
  }

  deleteServicioAdicional(id: string): Observable<null> {
    return this.api.delete<null>(`/servicios-adicionales/${id}`);
  }

  // ── Empleado Sucursal ──
  getEmpleadoSucursalAssignments(usuarioId: string): Observable<EmpleadoSucursal[]> {
    return this.api.get<EmpleadoSucursal[]>(`/users/${usuarioId}/sucursales`);
  }

  addEmpleadoSucursalAssignment(usuarioId: string, sucursalId: string): Observable<unknown> {
    return this.api.post<unknown>(`/users/${usuarioId}/sucursales`, { sucursal_id: sucursalId });
  }



  // ── Reservations ──
  getReservas(filters: Record<string, string | number | boolean | undefined> = {}): Observable<PaginationResponse<Reserva>> {
    const params: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params[k] = v;
    });
    return this.api.getPaginated<Reserva>('/reservas', params);
  }

  buscarReservas(params: Record<string, string | number | boolean>): Observable<Reserva[]> {
    return this.api.get<Reserva[]>('/reservas/buscar', params);
  }

  confirmarReserva(id: string, payload: { metodo_pago: string; transaccion_referencia?: string }): Observable<Reserva> {
    return this.api.patch<Reserva>(`/reservas/${id}/confirmar-pago-reserva`, payload);
  }

  pagarSaldoReserva(id: string, payload: { metodo_pago: string; transaccion_referencia?: string }): Observable<Reserva> {
    return this.api.patch<Reserva>(`/reservas/${id}/pagar-saldo`, payload);
  }

  activarAlquilerReserva(id: string): Observable<Alquiler> {
    return this.api
      .post<Alquiler>(`/reservas/${id}/activar-alquiler`, {})
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }
  // ── Rentals ──
  getRentals(filters: Record<string, string | number | boolean | undefined> = {}): Observable<PaginationResponse<Alquiler>> {
    const params: Record<string, string | number | boolean> = {};
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params[k] = v;
    });
    return this.api.getPaginated<Alquiler>('/alquileres', params).pipe(
      map((res) => ({
        ...res,
        data: (res.data ?? []).map((alquiler) => this.normalizeAlquiler(alquiler)),
      })),
    );
  }

  getRental(id: string): Observable<Alquiler> {
    return this.api
      .get<Alquiler>(`/alquileres/${id}`)
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  createRental(payload: CreateAlquilerRequest): Observable<Alquiler> {
    return this.api
      .post<Alquiler>('/alquileres', payload)
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  confirmarPagoRental(id: string, payload: { monto: number; metodo_pago: string; transaccion_referencia?: string; reserva_id?: string }): Observable<unknown> {
    return this.api.post<unknown>('/pagos', {
      alquiler_id: id,
      reserva_id: payload.reserva_id,
      monto: payload.monto,
      metodo_pago: payload.metodo_pago,
      tipo_pago: 'RESERVA',
      transaccion_referencia: payload.transaccion_referencia,
    });
  }

  pagarSaldoRental(reservaId: string, payload: { metodo_pago: string; transaccion_referencia?: string }): Observable<unknown> {
    return this.pagarSaldoReserva(reservaId, payload);
  }

  entregarRental(id: string, data: EntregarAlquilerOperativoRequest): Observable<Alquiler> {
    return this.api
      .patch<Alquiler>(`/alquileres/${id}/entregar`, data)
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  devolverRental(id: string, data: DevolverAlquilerOperativoRequest): Observable<Alquiler> {
    return this.api
      .patch<Alquiler>(`/alquileres/${id}/devolver`, data)
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  prepararLiquidacionRental(id: string): Observable<Alquiler> {
    return this.api
      .patch<Alquiler>(`/alquileres/${id}/preparar-liquidacion`, {})
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  completarDevolucionRental(id: string): Observable<Alquiler> {
    return this.api
      .patch<Alquiler>(`/alquileres/${id}/finalizar`, {})
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  anularRental(id: string, motivo?: string): Observable<Alquiler> {
    return this.api
      .patch<Alquiler>(`/alquileres/${id}/cancelar`, { motivo })
      .pipe(map((alquiler) => this.normalizeAlquiler(alquiler)));
  }

  getReporteDevolucion(id: string): Observable<ReporteDevolucion> {
    return this.api.get<ReporteDevolucion>(`/alquileres/${id}/reporte-devolucion`);
  }

  cobrarPenalidades(id: string, reservaId: string, monto: number, metodo_pago: string): Observable<Pago> {
    return this.api.post<Pago>('/pagos', {
      alquiler_id: id,
      reserva_id: reservaId,
      monto,
      metodo_pago,
      tipo_pago: 'PENALIDAD',
    });
  }

  registrarPagoCargo(
    alquilerId: string,
    reservaId: string,
    monto: number,
    metodoPago: string,
  ): Observable<Pago> {
    return this.api.post<Pago>('/pagos', {
      alquiler_id: alquilerId,
      reserva_id: reservaId,
      monto,
      metodo_pago: metodoPago,
      tipo_pago: 'CARGO_ADICIONAL',
      transaccion_referencia: 'LIQ-' + Date.now(),
    });
  }

  confirmarPago(id: string): Observable<Pago> {
    return this.api.patch<Pago>(`/pagos/${id}/confirmar`, {});
  }

  registrarEntrega(payload: EntregaOperativaRequest): Observable<unknown> {
    return this.api.post<unknown>('/entregas', payload);
  }

  registrarDevolucion(payload: DevolucionOperativaRequest): Observable<{ id: string }> {
    return this.api.post<{ id: string }>('/devoluciones', payload);
  }

  registrarCargo(payload: CargoAdicionalRequest): Observable<unknown> {
    return this.api.post<unknown>('/cargos-adicionales', payload);
  }

  getCargosAdicionales(alquilerId: string): Observable<CargoAdicionalResponse[]> {
    return this.api
      .getPaginated<CargoAdicionalResponse>('/cargos-adicionales', {
        page: 1,
        limit: 100,
        alquiler_id: alquilerId,
      })
      .pipe(map((res) => res.data ?? []));
  }

  actualizarCargo(id: string, payload: Partial<CargoAdicionalResponse>): Observable<CargoAdicionalResponse> {
    return this.api.patch<CargoAdicionalResponse>(`/cargos-adicionales/${id}`, payload);
  }

  registrarLiquidacion(payload: LiquidacionRequest): Observable<unknown> {
    return this.api.post<unknown>('/liquidaciones', payload);
  }

  getLiquidaciones(alquilerId: string): Observable<LiquidacionFinalResponse[]> {
    return this.api
      .getPaginated<LiquidacionFinalResponse>('/liquidaciones', {
        page: 1,
        limit: 20,
        alquiler_id: alquilerId,
      })
      .pipe(map((res) => res.data ?? []));
  }

  actualizarLiquidacion(
    id: string,
    payload: Partial<LiquidacionFinalResponse>,
  ): Observable<LiquidacionFinalResponse> {
    return this.api.patch<LiquidacionFinalResponse>(`/liquidaciones/${id}`, payload);
  }

  registrarContrato(payload: ContratoAlquilerRequest): Observable<unknown> {
    return this.api.post<unknown>('/contratos-alquiler', payload);
  }

  uploadInspeccionFoto(file: File): Observable<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ url: string; filename: string }>('/uploads/inspeccion', formData);
  }

  uploadContrato(file: File): Observable<{ url: string; filename: string; nombre_archivo: string; mime_type: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.api.post<{ url: string; filename: string; nombre_archivo: string; mime_type: string }>('/uploads/contrato', formData);
  }

  private normalizeAlquiler(alquiler: Alquiler): Alquiler {
    const reserva = alquiler.reserva;
    if (!reserva) return alquiler;

    const montoTotal =
      Number(reserva.monto_total_estimado ?? reserva.monto_estimado ?? 0);

    return {
      ...alquiler,
      reserva,
      reserva_id: alquiler.reserva_id ?? reserva.id,
      cliente_id: reserva.cliente_id,
      vehiculo_id: reserva.vehiculo_id,
      sucursal_recojo_id: reserva.sucursal_recojo_id,
      sucursal_devolucion_id: reserva.sucursal_devolucion_id,
      fecha_reserva: reserva.fecha_reserva ?? reserva.fecha_creacion ?? '',
      fecha_inicio_programada: reserva.fecha_inicio_programada ?? reserva.fecha_inicio ?? '',
      fecha_fin_programada: reserva.fecha_fin_programada ?? reserva.fecha_fin ?? '',
      fecha_retorno_real: alquiler.fecha_retorno_real ?? undefined,
      kilometraje_inicial: alquiler.kilometraje_inicial ?? reserva.vehiculo?.kilometraje ?? 0,
      kilometraje_final: alquiler.kilometraje_final,
      nivel_combustible_inicial: alquiler.nivel_combustible_inicial ?? '1/1',
      nivel_combustible_final: alquiler.nivel_combustible_final,
      tarifa_diaria_aplicada: Number(reserva.tarifa_diaria_aplicada ?? 0),
      monto_alquiler_base: Number(reserva.monto_alquiler_base ?? 0),
      monto_servicios_adicionales:
        Number(reserva.monto_servicios_adicionales ?? 0) +
        Number(reserva.monto_conductores_adic ?? 0),
      monto_impuestos: Number(reserva.monto_impuestos ?? 0),
      monto_descuento: Number(reserva.monto_descuento ?? 0),
      monto_total: montoTotal,
      observaciones: reserva.observaciones,
      cliente: reserva.cliente,
      vehiculo: reserva.vehiculo,
      sucursal_recojo: reserva.sucursal_recojo,
      sucursal_devolucion: reserva.sucursal_devolucion,
      servicios: reserva.servicios?.map((servicio) => ({
        alquiler_id: alquiler.id,
        servicio_adicional_id: servicio.servicio_id ?? servicio.servicio_adicional_id ?? '',
        precio_aplicado: servicio.precio_aplicado,
        cantidad: servicio.cantidad,
        servicio_adicional: servicio.servicio ?? servicio.servicio_adicional,
      })),
      pagos: reserva.pagos,
    };
  }
}
