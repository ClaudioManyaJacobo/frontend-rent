import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import {
  DocumentoUsuario,
  SubirDocumentoRequest,
} from '../../../shared/models/documento-identidad.model';

@Injectable({ providedIn: 'root' })
export class DocumentosUsuarioService {
  private readonly api = inject(ApiService);

  subir(dto: SubirDocumentoRequest): Observable<DocumentoUsuario> {
    return this.api.post<DocumentoUsuario>('/documentos-usuario/subir', dto);
  }

  listar(): Observable<DocumentoUsuario[]> {
    return this.api.get<DocumentoUsuario[]>('/documentos-usuario');
  }

  obtener(id: string): Observable<DocumentoUsuario> {
    return this.api.get<DocumentoUsuario>(`/documentos-usuario/${id}`);
  }
}
