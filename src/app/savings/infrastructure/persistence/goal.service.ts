// ============================================
// Goal Service
// Gestión de metas de ahorro
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Goal, CreateGoalPayload, UpdateGoalProgressPayload } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class GoalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.goals}`;

  /**
   * Obtiene todas las metas del usuario
   */
  getAll(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.baseUrl);
  }

  /**
   * Obtiene una meta por ID
   */
  getById(id: number): Observable<Goal> {
    return this.http.get<Goal>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea una nueva meta
   */
  create(payload: CreateGoalPayload): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, payload);
  }

  /**
   * Actualiza el progreso de una meta
   */
  updateProgress(id: number, payload: UpdateGoalProgressPayload): Observable<Goal> {
    return this.http.patch<Goal>(`${this.baseUrl}/${id}/progress`, payload);
  }

  /**
   * Marca una meta completada como celebrada
   */
  celebrate(id: number): Observable<Goal> {
    return this.http.post<Goal>(`${this.baseUrl}/${id}/celebrate`, {});
  }

  /**
   * Elimina una meta
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
