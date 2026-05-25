import { Role } from './role.model';
import { Perfil } from './perfil.model';

export interface User {
  id: string;
  email: string;
  role: Role | null;
  perfil_completado: boolean;
  esta_activo: boolean;
  ultimo_login: string | null;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  perfil?: Perfil;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  roleId?: string;
  esta_activo?: boolean;
  perfil_completado?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  roleId?: string;
  esta_activo?: boolean;
  perfil_completado?: boolean;
}
