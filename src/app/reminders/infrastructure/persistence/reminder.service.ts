// ============================================
// Reminder Service
// Gestión de recordatorios
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Reminder, CreateReminderPayload } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class ReminderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.reminders}`;

  /**
   * Obtiene todos los recordatorios del usuario
   */
  getAll(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(this.baseUrl);
  }

  /**
   * Obtiene un recordatorio por ID
   */
  getById(id: number): Observable<Reminder> {
    return this.http.get<Reminder>(`${this.baseUrl}/${id}`);
  }

  /**
   * Crea un nuevo recordatorio
   */
  create(payload: CreateReminderPayload): Observable<Reminder> {
    return this.http.post<Reminder>(this.baseUrl, payload);
  }

  /**
   * Marca un recordatorio como completado
   */
  markAsComplete(id: number): Observable<Reminder> {
    return this.http.patch<Reminder>(`${this.baseUrl}/${id}/complete`, {});
  }

  /**
   * Elimina un recordatorio
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Obtiene recordatorios pendientes
   */
  getPending(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(this.baseUrl);
  }

  /**
   * Obtiene recordatorios vencidos
   */
  getOverdue(): Observable<Reminder[]> {
    return this.http.get<Reminder[]>(this.baseUrl);
  }
}
