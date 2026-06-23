export interface ServicioAdicional {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  tipo_cobro: string;
  esta_activo: boolean;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateServicioAdicionalRequest {
  nombre: string;
  descripcion?: string;
  precio: number;
  tipo_cobro?: string;
  esta_activo?: boolean;
}

export type UpdateServicioAdicionalRequest = Partial<CreateServicioAdicionalRequest>;
