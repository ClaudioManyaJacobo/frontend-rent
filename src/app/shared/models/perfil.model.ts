import { Empresa } from './empresa.model';
import { Sucursal } from './sucursal.model';
import { User } from './user.model';

export interface Perfil {
  id: string;
  usuario_id: string;
  nombres: string;
  apellidos: string;
  dni: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  genero: string | null;
  direccion: string | null;
  foto_url: string | null;
  cargo: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  usuario?: User;
  empresa?: Empresa | null;
  sucursal_id?: string | null;
  sucursal?: Sucursal | null;
}

export interface UpdatePerfilRequest {
  empresa_id?: string;
  nombres?: string;
  apellidos?: string;
  dni?: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: string;
  direccion?: string;
  foto_url?: string;
  cargo?: string;
}
