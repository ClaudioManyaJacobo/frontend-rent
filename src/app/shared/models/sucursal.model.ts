import { DecimalPipe } from '@angular/common';
import { Empresa } from './empresa.model';

export interface Sucursal {
  id: string;
  empresa_id?: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string | null;
  email: string | null;
  latitud: number;
  longitud: number;
  foto_sucursal: string;
  esta_activa: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  empresa?: Empresa;
}

export interface CreateSucursalRequest {
  empresa_id?: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string;
  email?: string;
  latitud?: number;
  longitud?: number;
  foto_sucursal?: string;
  esta_activa: boolean;
}

export type UpdateSucursalRequest = Partial<
  Omit<CreateSucursalRequest, 'empresa_id'>
>;
