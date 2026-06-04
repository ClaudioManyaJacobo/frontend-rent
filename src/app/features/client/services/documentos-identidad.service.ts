import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import {
  DocumentoIdentidad,
  SubirDocumentoRequest,
  EstadoValidacionResponse,
} from '../../../shared/models/documento-identidad.model';

@Injectable({ providedIn: 'root' })
export class DocumentosIdentidadService {
  private readonly api = inject(ApiService);

  subir(dto: SubirDocumentoRequest): Observable<DocumentoIdentidad> {
    return this.api.post<DocumentoIdentidad>('/documentos-identidad/subir', dto);
  }

  listar(): Observable<DocumentoIdentidad[]> {
    return this.api.get<DocumentoIdentidad[]>('/documentos-identidad');
  }

  obtenerEstado(): Observable<EstadoValidacionResponse> {
    return this.api.get<EstadoValidacionResponse>(
      '/documentos-identidad/estado',
    );
  }

  obtener(id: string): Observable<DocumentoIdentidad> {
    return this.api.get<DocumentoIdentidad>(`/documentos-identidad/${id}`);
  }
}
