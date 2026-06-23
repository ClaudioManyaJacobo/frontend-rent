export interface Modulo {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  fecha_creacion?: string;
}

export interface CreateModuloRequest {
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export type UpdateModuloRequest = Partial<CreateModuloRequest>;
