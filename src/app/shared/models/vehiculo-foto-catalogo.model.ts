export interface VehiculoFotoCatalogo {
  id: string;
  vehiculo_id: string;
  foto_url: string;
  tipo_foto: string;
  orden: number;
  es_principal: boolean;
}

export interface CreateVehiculoFotoCatalogoRequest {
  vehiculo_id: string;
  foto_url: string;
  tipo_foto: string;
  orden?: number;
  es_principal?: boolean;
}
