import { Empresa } from '../admin/company.model';
import { Sucursal } from '../admin/branch.model';
import { User } from './user.model';

export interface Perfil {
  id: string;
  usuario_id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  dni: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  foto_url: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  usuario?: User;
  empresa?: Empresa | null;
  sucursal_id?: string | null;
  sucursal?: Sucursal | null;
  validacion?: {
    mensajes: string[];
    progreso_perfil: number;
    progreso_docs: number;
    progreso_total: number;
  };
}

export interface UpdatePerfilRequest {
  empresa_id?: string;
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  dni?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  foto_url?: string;
}
