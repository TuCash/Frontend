// ============================================
// Account Service
// Gestión de cuentas financieras
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Account, CreateAccountPayload } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.accounts}`;

  /**
   * Obtiene todas las cuentas del usuario autenticado
   */
  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.baseUrl);
  }

  /**
   * Obtiene una cuenta por ID
   */
  getById(id: number): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva cuenta
   */
  create(payload: CreateAccountPayload): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, payload);
  }

  /**
   * Elimina una cuenta
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
