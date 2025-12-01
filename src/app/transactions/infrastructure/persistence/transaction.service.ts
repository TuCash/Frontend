// ============================================
// Transaction Service
// Gestión de transacciones (ingresos, gastos, transferencias)
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilter,
  PaginatedResponse,
} from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.transactions}`;

  /**
   * Obtiene transacciones con filtros y paginación
   */
  getAll(filters: TransactionFilter = {}): Observable<PaginatedResponse<Transaction>> {
    let params = new HttpParams();

    if (filters.type) params = params.set('type', filters.type);
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId.toString());
    if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
    if (filters.toDate) params = params.set('toDate', filters.toDate);
    params = params.set('page', (filters.page ?? 0).toString());
    params = params.set('size', (filters.size ?? 20).toString());

    return this.http.get<PaginatedResponse<Transaction>>(this.baseUrl, { params });
  }

  /**
   * Obtiene solo ingresos
   */
  getIncomes(filters: Omit<TransactionFilter, 'type'> = {}): Observable<PaginatedResponse<Transaction>> {
    return this.getAll({ ...filters, type: 'INCOME' });
  }

  /**
   * Obtiene solo gastos
   */
  getExpenses(filters: Omit<TransactionFilter, 'type'> = {}): Observable<PaginatedResponse<Transaction>> {
    return this.getAll({ ...filters, type: 'EXPENSE' });
  }

  /**
   * Obtiene una transacción por ID
   */
  getById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva transacción
   */
  create(payload: CreateTransactionPayload): Observable<Transaction> {
    return this.http.post<Transaction>(this.baseUrl, payload);
  }

  /**
   * Actualiza una transacción existente
   */
  update(id: number, payload: UpdateTransactionPayload): Observable<Transaction> {
    return this.http.put<Transaction>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Elimina una transacción
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
