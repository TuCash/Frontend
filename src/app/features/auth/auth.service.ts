import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly LOGIN_URL = `${environment.apiBaseUrl}${environment.endpoints.login}`;
  private readonly REGISTER_URL = `${environment.apiBaseUrl}${environment.endpoints.register}`;

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.LOGIN_URL, payload).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
      }),
      catchError(error => {
        console.error('Login failed', error);
        return throwError(() => error);
      })
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.REGISTER_URL, payload).pipe(
      catchError(error => {
        console.error('Registration failed', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  getCurrentUser(): AuthResponse['user'] | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  clearSession(): void {
    this.logout();
  }
}
