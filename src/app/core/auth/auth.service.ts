import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../http/api.service';
import { TokenStorageService } from './token-storage.service';
import {
  AuthSession,
  AuthUser,
  LoginRequest,
  LoginResponseData,
  RegisterRequest,
} from '../../shared/models/auth.model';
import { User } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly storage = inject(TokenStorageService);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(
    this.storage.getSession(),
  );

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.sessionSignal()?.token);
  readonly currentUser = computed(() => this.sessionSignal()?.user ?? null);

  login(dto: LoginRequest): Observable<LoginResponseData> {
    return this.api.post<LoginResponseData>('/auth/login', dto).pipe(
      tap((data) => this.persistSession(data.access_token, data.user)),
    );
  }

  register(dto: RegisterRequest): Observable<User> {
    return this.api.post<User>('/auth/register', dto);
  }

  logout(): void {
    this.storage.clear();
    this.sessionSignal.set(null);
    void this.router.navigate(['/auth/login']);
  }

  private persistSession(token: string, user: AuthUser): void {
    const session: AuthSession = { token, user };
    this.storage.saveSession(session);
    this.sessionSignal.set(session);
  }
}
