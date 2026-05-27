export interface CategoriaVehiculo {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_diario_base: number;
  tarifa_km_extra: number;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
}

export interface CreateCategoriaVehiculoRequest {
  nombre: string;
  descripcion?: string;
  precio_diario_base: number;
  tarifa_km_extra?: number;
}

export type UpdateCategoriaVehiculoRequest =
  Partial<CreateCategoriaVehiculoRequest>;
