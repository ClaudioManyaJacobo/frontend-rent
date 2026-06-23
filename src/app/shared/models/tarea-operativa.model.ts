export interface TareaOperativa {
  id: string;
  vehiculo_id: string;
  alquiler_id: string | null;
  sucursal_id: string;
  tipo_tarea: string;
  descripcion: string;
  estado: string;
  asignado_a_id: string | null;
  fecha_programada: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}

export interface CreateTareaOperativaRequest {
  vehiculo_id: string;
  alquiler_id?: string;
  sucursal_id: string;
  tipo_tarea: string;
  descripcion: string;
  estado?: string;
  asignado_a_id?: string;
  fecha_programada?: string;
}

export type UpdateTareaOperativaRequest = Partial<CreateTareaOperativaRequest>;
