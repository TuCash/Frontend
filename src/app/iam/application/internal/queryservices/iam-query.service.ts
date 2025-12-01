/**
 * IAM Bounded Context - Application Layer
 * IAM Query Service
 * Maneja operaciones de lectura (get user, check session)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetUserByIdQuery } from '../../../domain/model/queries/get-user-by-id.query';
import { UserResource } from '../../../presentation/resources/user.resource';
import { SignInResponse } from '../../../presentation/resources/sign-in.resource';

@Injectable({ providedIn: 'root' })
export class IamQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  /**
   * Ejecuta la query GetUserById
   */
  handle(query: GetUserByIdQuery): Observable<UserResource> {
    return this.http.get<UserResource>(
      `${this.baseUrl}${environment.endpoints.users}/${query.userId}`
    );
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Obtiene el usuario actual desde localStorage
   */
  getCurrentUser(): SignInResponse | null {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId(): number | null {
    const user = this.getCurrentUser();
    return user ? user.id : null;
  }

  /**
   * Obtiene el token JWT
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}
