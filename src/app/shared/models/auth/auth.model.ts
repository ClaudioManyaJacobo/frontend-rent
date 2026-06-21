import { Perfil } from '../user/profile.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  empresaId?: string | null;
  sucursalId?: string | null;
  esta_activo: boolean;
  ultimo_login?: string;
  perfil?: Perfil;
}

export interface LoginResponseData {
  access_token: string;
  user: AuthUser;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}
