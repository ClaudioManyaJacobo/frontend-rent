import { Empresa } from './empresa.model';

export interface Sucursal {
  id: string;
  empresa_id?: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string | null;
  email: string | null;
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
  esta_activa?: boolean;
}

export type UpdateSucursalRequest = Partial<
  Omit<CreateSucursalRequest, 'empresa_id'>
>;
