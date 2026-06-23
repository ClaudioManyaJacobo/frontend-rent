import {
  CombustibleVehiculo,
  TransmisionVehiculo,
  VehiculoEstado,
} from '../../constants/fleet.constants';
import { CategoriaVehiculo } from './category.model';
import { Sucursal } from '../admin/branch.model';

export interface VehiculoEstadoOperativo {
  id: string;
  vehiculo_id: string;
  limpio: boolean;
  desinfectado: boolean;
  tanque_combustible: string;
  soat_vigente: boolean;
  revision_tecnica_vigente: boolean;
  sin_danos_visibles: boolean;
  llanta_repuesto: boolean;
  gata: boolean;
  llave_ruedas: boolean;
  triangulo_seguridad: boolean;
  extintor: boolean;
  botiquin: boolean;
  fecha_actualizacion?: string;
}

export interface Vehiculo {
  id: string;
  categoria_id?: string;
  sucursal_actual_id?: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  kilometraje: number;
  transmision: TransmisionVehiculo;
  combustible: CombustibleVehiculo;
  combustible_actual_pct?: number;
  capacidad_pasajeros: number;
  numero_puertas: number;
  precio_diario_personalizado: number | null;
  estado: VehiculoEstado;
  foto_url: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  categoria?: CategoriaVehiculo;
  sucursal_actual?: Sucursal;
  estado_operativo?: VehiculoEstadoOperativo;
}

export interface CreateVehiculoRequest {
  categoria_id: string;
  sucursal_actual_id: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  color: string;
  kilometraje?: number;
  transmision: TransmisionVehiculo;
  combustible: CombustibleVehiculo;
  capacidad_pasajeros?: number;
  numero_puertas?: number;
  precio_diario_personalizado?: number;
  estado?: VehiculoEstado;
  foto_url?: string;
}

export type UpdateVehiculoRequest = Partial<CreateVehiculoRequest>;

export interface VehiculosQueryParams {
  page?: number;
  limit?: number;
  empresa_id?: string;
  sucursal_id?: string;
  estado?: VehiculoEstado;
}
