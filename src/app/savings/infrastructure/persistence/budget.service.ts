// ============================================
// Budget Service
// Gestión de presupuestos
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Budget, CreateBudgetPayload } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class BudgetService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.budgets}`;

  /**
   * Obtiene todos los presupuestos del usuario
   */
  getAll(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.baseUrl);
  }

  /**
   * Obtiene un presupuesto por ID
   */
  getById(id: number): Observable<Budget> {
    return this.http.get<Budget>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo presupuesto
   */
  create(payload: CreateBudgetPayload): Observable<Budget> {
    return this.http.post<Budget>(this.baseUrl, payload);
  }

  /**
   * Elimina un presupuesto
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene presupuestos activos
   */
  getActive(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.baseUrl);
  }

  /**
   * Obtiene presupuestos con advertencia (>80%)
   */
  getWarnings(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.baseUrl);
  }
}
