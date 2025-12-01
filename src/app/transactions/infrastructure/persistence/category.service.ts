// ============================================
// Category Service
// Gestión de categorías de transacciones
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CategoryType, CreateCategoryPayload } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.categories}`;

  /**
   * Obtiene todas las categorías del usuario
   * @param type Filtro opcional por tipo (INCOME o EXPENSE)
   */
  getAll(type?: CategoryType): Observable<Category[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<Category[]>(this.baseUrl, { params });
  }

  /**
   * Obtiene categorías de ingresos
   */
  getIncomeCategories(): Observable<Category[]> {
    return this.getAll('INCOME');
  }

  /**
   * Obtiene categorías de gastos
   */
  getExpenseCategories(): Observable<Category[]> {
    return this.getAll('EXPENSE');
  }

  /**
   * Obtiene una categoría por ID
   */
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva categoría personalizada
   */
  create(payload: CreateCategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, payload);
  }

  /**
   * Elimina una categoría personalizada
   * Nota: No se pueden eliminar categorías del sistema
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
