import { Modulo } from './modulo.model';

export interface Permiso {
  id: string;
  codigo: string;
  accion: string;
  descripcion: string | null;
  modulo_id: string;
  modulo?: Modulo;
  fecha_creacion?: string;
}

export interface CreatePermisoRequest {
  codigo: string;
  accion: string;
  descripcion?: string;
  modulo_id: string;
}

export type UpdatePermisoRequest = Partial<CreatePermisoRequest>;
