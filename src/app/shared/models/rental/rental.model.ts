import { User } from '../user/user.model';
import { Vehiculo } from '../vehicle/vehicle.model';
import { Sucursal } from '../admin/branch.model';

export type AlquilerEstado =
  | 'PENDIENTE_ENTREGA'
  | 'EN_CURSO'
  | 'PENDIENTE_DEVOLUCION'
  | 'PENDIENTE_LIQUIDACION'
  | 'FINALIZADO'
  | 'PENDIENTE_PAGO'
  | 'RESERVADO'
  | 'CONFIRMADO'
  | 'LISTO_ENTREGA'
  | 'ENTREGADO_PROCESO'
  | 'EN_REVISION'
  | 'DEVUELTO_COMPLETADO'
  | 'CANCELADO'
  | 'INCUMPLIDO';

export const ESTADO_LABELS: Record<string, string> = {
  PENDIENTE_ENTREGA: 'Pendiente de entrega',
  EN_CURSO: 'En curso',
  PENDIENTE_DEVOLUCION: 'Pendiente de devolución',
  PENDIENTE_LIQUIDACION: 'Pendiente de liquidación',
  FINALIZADO: 'Finalizado',
  PENDIENTE_PAGO: 'Pendiente de Pago',
  RESERVADO: 'Reservado',
  CONFIRMADO: 'Confirmado',
  LISTO_ENTREGA: 'Listo para Entrega',
  ENTREGADO_PROCESO: 'Entregado',
  EN_REVISION: 'En Revisión',
  DEVUELTO_COMPLETADO: 'Completado',
  CANCELADO: 'Cancelado',
  INCUMPLIDO: 'Incumplido',
};

export const ESTADO_CLASS: Record<string, string> = {
  PENDIENTE_ENTREGA: 'badge-info',
  EN_CURSO: 'badge-primary',
  PENDIENTE_DEVOLUCION: 'badge-warning',
  PENDIENTE_LIQUIDACION: 'badge-secondary',
  FINALIZADO: 'badge-success',
  PENDIENTE_PAGO: 'badge-warning',
  RESERVADO: 'badge-warning',
  CONFIRMADO: 'badge-info',
  LISTO_ENTREGA: 'badge-info',
  ENTREGADO_PROCESO: 'badge-primary',
  EN_REVISION: 'badge-secondary',
  DEVUELTO_COMPLETADO: 'badge-success',
  CANCELADO: 'badge-danger',
  INCUMPLIDO: 'badge-danger',
};

export interface ServicioAdicionalItem {
  servicio_adicional_id: string;
  cantidad: number;
}

export interface AlquilerServicio {
  alquiler_id: string;
  servicio_adicional_id: string;
  precio_aplicado: number;
  cantidad: number;
  servicio_adicional?: ServicioAdicional;
}

export interface ServicioAdicional {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  tipo_cobro: string;
  esta_activo: boolean;
}

export interface InspeccionAccesorio {
  id: string;
  inspeccion_id: string;
  nombre_accesorio: string;
  presente: boolean;
  observacion?: string;
}

export interface InspeccionFoto {
  id: string;
  inspeccion_id: string;
  tipo_foto: string;
  url: string;
}

export interface Inspeccion {
  id: string;
  alquiler_id: string;
  inspector_id: string;
  tipo_inspeccion: string;
  fecha_inspeccion: string;
  kilometraje: number;
  nivel_combustible: string;
  estado_carroceria: string;
  estado_interior: string;
  observaciones?: string;
  inspector?: User;
  accesorios?: InspeccionAccesorio[];
  fotos?: InspeccionFoto[];
}

export interface Pago {
  id: string;
  alquiler_id?: string | null;
  reserva_id?: string | null;
  monto: number;
  metodo_pago: string | null;
  estado_pago: string;
  tipo_pago: string;
  transaccion_referencia?: string;
  fecha_pago?: string;
}

export interface IncidenciaAlquiler {
  id: string;
  alquiler_id: string;
  reportado_por_id: string;
  tipo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  fecha_incidente: string;
  fecha_reporte: string;
}

export interface IncidenciaFoto {
  id: string;
  incidencia_id: string;
  foto: string;
  nombre_archivo: string;
  mime_type: string;
  orden: number;
}

export interface DanoAlquiler {
  id: string;
  alquiler_id: string;
  descripcion: string;
  costo: number;
  aprobado: boolean;
  foto_url?: string;
  fecha_creacion: string;
}

export interface PenalidadAlquiler {
  id: string;
  alquiler_id: string;
  tipo_penalidad: string;
  concepto: string;
  monto: number;
  estado: string;
  fecha_creacion: string;
}

export interface CalificacionAlquiler {
  id: string;
  alquiler_id: string;
  cliente_calificacion?: number;
  empresa_calificacion?: number;
  cliente_comentario?: string;
  empresa_comentario?: string;
}

export interface Alquiler {
  id: string;
  reserva_id?: string | null;
  reserva?: Reserva;
  cliente_id: string;
  vehiculo_id: string;
  sucursal_recojo_id: string;
  sucursal_devolucion_id: string;
  fecha_creacion?: string;
  fecha_reserva: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
  fecha_inicio_real?: string | null;
  fecha_fin_real?: string | null;
  fecha_retorno_real?: string;
  kilometraje_inicial: number;
  kilometraje_final?: number;
  nivel_combustible_inicial: string;
  nivel_combustible_final?: string;
  tarifa_diaria_aplicada: number;
  monto_alquiler_base: number;
  monto_servicios_adicionales: number;
  monto_impuestos: number;
  monto_descuento: number;
  monto_total: number;
  estado: AlquilerEstado;
  observaciones?: string;
  cliente?: User;
  vehiculo?: Vehiculo;
  sucursal_recojo?: Sucursal;
  sucursal_devolucion?: Sucursal;
  servicios?: AlquilerServicio[];
  inspecciones?: Inspeccion[];
  pagos?: Pago[];
  incidencias?: IncidenciaAlquiler[];
  danos?: DanoAlquiler[];
  penalidades?: PenalidadAlquiler[];
  calificaciones?: CalificacionAlquiler[];
}

export type ReservaEstado =
  | 'RESERVADA_TEMPORAL'
  | 'PENDIENTE_PAGO_RESERVA'
  | 'RESERVADA'
  | 'PENDIENTE_PAGO_SALDO'
  | 'PAGADA'
  | 'EN_CURSO'
  | 'PENDIENTE_LIQUIDACION'
  | 'FINALIZADA'
  | 'CANCELADA'
  | 'VENCIDA'
  | 'PENDIENTE_CONFIRMACION'
  | 'CONFIRMADA'
  | 'EXPIRADA'
  | 'CONVERTIDA_ALQUILER';

export interface ReservaServicio {
  id?: string;
  reserva_id: string;
  servicio_adicional_id?: string;
  servicio_id?: string;
  nombre_servicio?: string;
  precio_aplicado: number;
  cantidad: number;
  servicio_adicional?: ServicioAdicional;
  servicio?: ServicioAdicional;
}

export interface ReservaConductor {
  id: string;
  reserva_id: string;
  nombres: string;
  dni: string;
  precio?: number;
  precio_adicional?: number;
  apellido_paterno?: string | null;
  apellido_materno?: string | null;
  licencia_numero?: string | null;
}

export interface Reserva {
  id: string;
  codigo_reserva: string;
  cliente_id: string;
  vehiculo_id: string;
  sucursal_recojo_id: string;
  sucursal_devolucion_id: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_inicio_programada?: string;
  fecha_fin_programada?: string;
  fecha_reserva?: string;
  dias?: number;
  dias_solicitados?: number;
  bloqueo_expira_en?: string | null;
  estado: ReservaEstado;
  tarifa_diaria_aplicada: number;
  monto_alquiler_base: number;
  monto_servicios_adicionales: number;
  monto_impuestos: number;
  monto_descuento: number;
  monto_estimado?: number;
  monto_total_estimado?: number;
  monto_reserva_aplicado?: number;
  monto_conductores_adic?: number;
  observaciones?: string;
  fecha_creacion?: string;
  cliente?: User;
  vehiculo?: Vehiculo;
  sucursal_recojo?: Sucursal;
  sucursal_devolucion?: Sucursal;
  servicios?: ReservaServicio[];
  conductores?: ReservaConductor[];
  pagos?: Pago[];
  alquiler?: Alquiler | null;
  alquileres?: Alquiler[];
}

export interface CreateAlquilerRequest {
  reserva_id: string;
}

export interface CreateReservaRequest {
  cliente_id?: string;
  vehiculo_id: string;
  sucursal_recojo_id: string;
  sucursal_devolucion_id: string;
  fecha_inicio?: string;
  fecha_fin: string;
  servicios_adicionales?: ServicioAdicionalItem[];
  conductores_adicionales?: Omit<ReservaConductor, 'id' | 'reserva_id'>[];
  observaciones?: string;
  metodo_pago?: string;
  transaccion_referencia?: string;
}

export interface EntregaOperativaRequest {
  alquiler_id: string;
  empleado_id: string;
  kilometraje_inicial: number;
  combustible_inicial_pct: number;
  observaciones?: string;
  firma_cliente?: boolean;
  firma_empleado?: boolean;
}

export interface AlquilerFotoOperativaRequest {
  tipo_foto: string;
  url: string;
}

export interface EntregarAlquilerOperativoRequest {
  kilometraje_inicial: number;
  combustible_inicial_pct: number;
  observaciones?: string;
  firma_cliente?: boolean;
  firma_empleado?: boolean;
  fotos?: AlquilerFotoOperativaRequest[];
}

export interface DevolverAlquilerOperativoRequest {
  kilometraje_final: number;
  combustible_final_pct: number;
  limpio?: boolean;
  sin_danos_visibles?: boolean;
  llanta_repuesto?: boolean;
  gata?: boolean;
  llave_ruedas?: boolean;
  triangulo_seguridad?: boolean;
  extintor?: boolean;
  botiquin?: boolean;
  danos_detectados?: boolean;
  combustible_menor_detectado?: boolean;
  requiere_limpieza?: boolean;
  observaciones?: string;
  fotos?: AlquilerFotoOperativaRequest[];
}

export interface DevolucionOperativaRequest {
  alquiler_id: string;
  empleado_id: string;
  kilometraje_final: number;
  combustible_final_pct: number;
  limpio?: boolean;
  sin_danos_visibles?: boolean;
  llanta_repuesto?: boolean;
  gata?: boolean;
  llave_ruedas?: boolean;
  triangulo_seguridad?: boolean;
  extintor?: boolean;
  botiquin?: boolean;
  danos_detectados?: boolean;
  combustible_menor_detectado?: boolean;
  requiere_limpieza?: boolean;
  observaciones?: string;
}

export interface CargoAdicionalRequest {
  alquiler_id: string;
  devolucion_id?: string;
  tipo_cargo: string;
  descripcion: string;
  cantidad?: number;
  precio_unitario?: number;
  monto?: number;
  estado?: string;
}

export interface LiquidacionRequest {
  alquiler_id: string;
  reserva_id: string;
  monto_total_reserva?: number;
  monto_cargos_adicionales?: number;
  monto_pagado_total?: number;
  saldo_final?: number;
  estado?: string;
  observaciones?: string;
}

export interface ContratoAlquilerRequest {
  alquiler_id: string;
  nombre_archivo?: string;
  mime_type?: string;
  url_archivo?: string;
  acepta_terminos?: boolean;
  acepta_politica_danos?: boolean;
  acepta_contrato?: boolean;
}

export interface AccesorioRequest {
  nombre_accesorio: string;
  presente?: boolean;
  observacion?: string;
}

export interface FotoRequest {
  tipo_foto: string;
  url: string;
}

export interface InspeccionEntregaRequest {
  kilometraje: number;
  nivel_combustible: string;
  estado_carroceria?: string;
  estado_interior?: string;
  observaciones?: string;
  accesorios?: AccesorioRequest[];
  fotos?: FotoRequest[];
}

export interface EntregarAlquilerRequest {
  inspeccion: InspeccionEntregaRequest;
  pago_id?: string;
}

export interface InspeccionDevolucionRequest {
  kilometraje: number;
  nivel_combustible: string;
  estado_carroceria?: string;
  estado_interior?: string;
  observaciones?: string;
  accesorios?: AccesorioRequest[];
  fotos?: FotoRequest[];
}

export interface DanoReportRequest {
  descripcion: string;
  costo: number;
  foto_url?: string;
}

export interface DevolverAlquilerRequest {
  inspeccion: InspeccionDevolucionRequest;
  danos?: DanoReportRequest[];
}

export interface ConfirmarPagoRequest {
  alquiler_id: string;
  monto: number;
  metodo_pago: string;
  transaccion_referencia?: string;
}

export interface AlquileresQueryParams {
  page?: number;
  limit?: number;
  cliente_id?: string;
  vehiculo_id?: string;
  sucursal_id?: string;
  estado?: AlquilerEstado;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface ReporteDevolucion {
  alquiler: {
    id: string;
    cliente: User;
    vehiculo: Vehiculo;
    estado: string;
    fecha_inicio_programada: string;
    fecha_fin_programada: string;
    fecha_retorno_real: string | null;
  };
  inspeccion_entrega: Inspeccion | null;
  inspeccion_devolucion: Inspeccion | null;
  comparacion: {
    km_entrega: number;
    km_devolucion: number;
    km_recorridos: number;
    combustible_entrega: string;
    combustible_devolucion: string;
    combustible_entrega_porcentaje: number;
    combustible_devolucion_porcentaje: number;
    diferencia_combustible_porcentaje: number;
    accesorios_faltantes: { nombre: string; estabaPresente: boolean; estaPresente: boolean }[];
  } | null;
  penalidades: PenalidadAlquiler[];
  danos: DanoAlquiler[];
  totales: {
    total_penalidades: number;
    total_danos: number;
    gran_total: number;
  };
}

export interface EntregaResponse {
  id: string;
  alquiler_id: string;
  empleado_id: string;
  kilometraje_inicial: number;
  combustible_inicial_pct: number;
  observaciones: string | null;
  firma_cliente: boolean;
  firma_empleado: boolean;
  fecha_entrega: string;
}

export interface EntregaFotoResponse {
  id: string;
  entrega_id: string;
  nombre_archivo: string;
  mime_type: string;
  tipo_foto: string;
  orden: number;
}

export interface DevolucionResponse {
  id: string;
  alquiler_id: string;
  empleado_id: string;
  kilometraje_final: number;
  combustible_final_pct: number;
  limpio: boolean;
  sin_danos_visibles: boolean;
  llanta_repuesto: boolean;
  gata: boolean;
  llave_ruedas: boolean;
  triangulo_seguridad: boolean;
  extintor: boolean;
  botiquin: boolean;
  danos_detectados: boolean;
  requiere_limpieza: boolean;
  observaciones: string | null;
}

export interface DevolucionFotoResponse {
  id: string;
  devolucion_id: string;
  nombre_archivo: string;
  mime_type: string;
  tipo_foto: string;
  orden: number;
}

export interface ContratoAlquilerResponse {
  id: string;
  alquiler_id: string;
  nombre_archivo: string;
  mime_type: string;
  acepta_terminos: boolean;
  acepta_politica_danos: boolean;
  acepta_contrato: boolean;
  fecha_firma: string;
}

export interface CargoAdicionalResponse {
  id: string;
  alquiler_id: string;
  devolucion_id: string | null;
  pago_id: string | null;
  tipo_cargo: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  monto: number;
  estado: string;
}

export interface LiquidacionFinalResponse {
  id: string;
  alquiler_id: string;
  reserva_id: string;
  monto_total_reserva: number;
  monto_cargos_adicionales: number;
  monto_pagado_total: number;
  saldo_final: number;
  estado: string;
  observaciones: string | null;
  fecha_liquidacion: string;
}
