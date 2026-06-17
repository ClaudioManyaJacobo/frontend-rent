export interface DocumentoUsuario {
  id: string;
  usuario_id: string;
  tipo_documento: 'DNI_FRONTAL' | 'DNI_REVERSO';
  archivo_url: string;
  texto_extraido: string | null;
  dni_extraido: string | null;
  estado_validacion: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'OBSERVADO';
  observaciones: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface SubirDocumentoRequest {
  tipo_documento: string;
  archivo_url: string;
}
