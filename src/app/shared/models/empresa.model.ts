export interface Empresa {
  id: string;
  ruc: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  logo: string | null;
  esta_activa: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateEmpresaRequest {
  ruc: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  logo?: string;
  esta_activa?: boolean;
}

export type UpdateEmpresaRequest = Partial<CreateEmpresaRequest>;
