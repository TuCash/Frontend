// ============================================
// Recurring Transaction Service
// Gestión de transacciones recurrentes
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RecurringTransaction,
  CreateRecurringTransactionPayload,
  UpdateRecurringTransactionStatusPayload,
} from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class RecurringTransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.recurringTransactions}`;

  /**
   * Obtiene todas las transacciones recurrentes del usuario
   */
  getAll(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>(this.baseUrl);
  }

  /**
   * Obtiene una transacción recurrente por ID
   */
  getById(id: number): Observable<RecurringTransaction> {
    return this.http.get<RecurringTransaction>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva transacción recurrente
   */
  create(payload: CreateRecurringTransactionPayload): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransaction>(this.baseUrl, payload);
  }

  /**
   * Activa o desactiva una transacción recurrente
   */
  updateStatus(
    id: number,
    payload: UpdateRecurringTransactionStatusPayload
  ): Observable<RecurringTransaction> {
    return this.http.patch<RecurringTransaction>(`${this.baseUrl}/${id}/status`, payload);
  }

  /**
   * Elimina una transacción recurrente
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene solo transacciones recurrentes activas
   */
  getActive(): Observable<RecurringTransaction[]> {
    return this.http.get<RecurringTransaction[]>(this.baseUrl);
  }
}
