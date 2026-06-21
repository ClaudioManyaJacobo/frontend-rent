import { User } from './user.model';
import { Vehiculo } from './vehiculo.model';
import { Sucursal } from './sucursal.model';

export type AlquilerEstado =
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

export interface Inspeccion {
  id: string;
  alquiler_id: string;
  inspector_id: string;
  tipo_inspeccion: string;
  fecha_inspeccion: string;
  kilometraje: number;
  nivel_combustible: string;
  tiene_llanta_repuesto: boolean;
  tiene_gata_herramientas: boolean;
  tiene_triangulo_seguridad: boolean;
  estado_carroceria: string;
  estado_interior: string;
  observaciones?: string;
  fotos_json_urls?: string;
  inspector?: User;
}

export interface Pago {
  id: string;
  alquiler_id: string;
  monto: number;
  metodo_pago: string;
  estado_pago: string;
  tipo_pago: string;
  transaccion_referencia?: string;
  fecha_pago?: string;
}

export interface IncidenciaAlquiler {
  id: string;
  alquiler_id: string;
  usuario_id: string;
  tipo: string;
  comentario: string;
  foto_url?: string;
  prioridad: string;
  estado: string;
  fecha_creacion: string;
  usuario?: User;
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
  cliente_id: string;
  vehiculo_id: string;
  sucursal_recojo_id: string;
  sucursal_devolucion_id: string;
  fecha_creacion?: string;
  fecha_reserva: string;
  fecha_inicio_programada: string;
  fecha_fin_programada: string;
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
  calificaciones?: CalificacionAlquiler[];
}

export interface CreateAlquilerRequest {
  cliente_id?: string;
  vehiculo_id: string;
  sucursal_recojo_id: string;
  sucursal_devolucion_id: string;
  fecha_inicio_programada?: string;
  fecha_fin_programada: string;
  servicios_adicionales?: ServicioAdicionalItem[];
  observaciones?: string;
  metodo_pago?: string;
  transaccion_referencia?: string;
}

export interface InspeccionEntregaRequest {
  kilometraje: number;
  nivel_combustible: string;
  tiene_llanta_repuesto?: boolean;
  tiene_gata_herramientas?: boolean;
  tiene_triangulo_seguridad?: boolean;
  estado_carroceria?: string;
  estado_interior?: string;
  observaciones?: string;
}

export interface EntregarAlquilerRequest {
  inspeccion: InspeccionEntregaRequest;
  pago_id?: string;
}

export interface InspeccionDevolucionRequest {
  kilometraje: number;
  nivel_combustible: string;
  tiene_llanta_repuesto?: boolean;
  tiene_gata_herramientas?: boolean;
  tiene_triangulo_seguridad?: boolean;
  estado_carroceria?: string;
  estado_interior?: string;
  observaciones?: string;
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
