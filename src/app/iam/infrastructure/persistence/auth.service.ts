import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  User,
  MessageResponse,
  UpdateUserPayload,
  UpdateUserPreferencesPayload,
} from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}${environment.auth.login}`, payload).pipe(
      tap((response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response));
      })
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}${environment.auth.register}`, payload);
  }

  forgotPassword(payload: ForgotPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${environment.auth.forgotPassword}`,
      payload
    );
  }

  resetPassword(payload: ResetPasswordPayload): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(
      `${this.baseUrl}${environment.auth.resetPassword}`,
      payload
    );
  }

  // ============================================
  // USER MANAGEMENT
  // ============================================

  getUser(userId: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}${environment.endpoints.users}/${userId}`);
  }

  updateUser(userId: number, payload: UpdateUserPayload): Observable<User> {
    return this.http.patch<User>(
      `${this.baseUrl}${environment.endpoints.users}/${userId}`,
      payload
    );
  }

  updateUserPreferences(
    userId: number,
    payload: UpdateUserPreferencesPayload
  ): Observable<User> {
    return this.http.patch<User>(
      `${this.baseUrl}${environment.endpoints.users}/${userId}/preferences`,
      payload
    );
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): AuthResponse | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearSession(): void {
    this.logout();
  }
}
