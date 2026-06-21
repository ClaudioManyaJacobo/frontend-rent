import { Role } from './role.model';
import { Perfil } from './profile.model';

export interface User {
  id: string;
  email: string;
  role: Role | null;
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
  empresa_id?: string;
  sucursal_id?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  roleId?: string;
  esta_activo?: boolean;
  empresa_id?: string;
  sucursal_id?: string;
}
