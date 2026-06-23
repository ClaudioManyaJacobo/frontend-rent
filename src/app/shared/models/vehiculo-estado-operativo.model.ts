export interface VehiculoEstadoOperativo {
  id: string;
  vehiculo_id: string;
  limpio: boolean;
  desinfectado: boolean;
  tanque_combustible: string;
  soat_vigente: boolean;
  revision_tecnica_vigente: boolean;
  sin_danos_visibles: boolean;
  llanta_repuesto: boolean;
  gata: boolean;
  llave_ruedas: boolean;
  triangulo_seguridad: boolean;
  extintor: boolean;
  botiquin: boolean;
}

export interface UpdateVehiculoEstadoOperativoRequest {
  limpio?: boolean;
  desinfectado?: boolean;
  tanque_combustible?: string;
  soat_vigente?: boolean;
  revision_tecnica_vigente?: boolean;
  sin_danos_visibles?: boolean;
  llanta_repuesto?: boolean;
  gata?: boolean;
  llave_ruedas?: boolean;
  triangulo_seguridad?: boolean;
  extintor?: boolean;
  botiquin?: boolean;
}
