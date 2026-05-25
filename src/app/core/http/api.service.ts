import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  PaginationResponse,
  SuccessResponse,
} from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  get<T>(path: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http
      .get<SuccessResponse<T>>(this.url(path), { params: this.toParams(params) })
      .pipe(map((res) => res.data));
  }

  getPaginated<T>(
    path: string,
    params?: Record<string, string | number | boolean>,
  ): Observable<PaginationResponse<T>> {
    return this.http.get<PaginationResponse<T>>(this.url(path), {
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<SuccessResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<SuccessResponse<T>>(this.url(path), body)
      .pipe(map((res) => res.data));
  }

  delete<T = null>(path: string): Observable<T> {
    return this.http
      .delete<SuccessResponse<T>>(this.url(path))
      .pipe(map((res) => res.data));
  }

  private toParams(
    params?: Record<string, string | number | boolean>,
  ): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      httpParams = httpParams.set(key, String(value));
    });
    return httpParams;
  }
}
