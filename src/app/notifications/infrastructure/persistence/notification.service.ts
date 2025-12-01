// ============================================
// Notification Service
// Gestión de notificaciones
// ============================================

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Notification } from '../../../shared/models/api.types';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.notifications}`;

  /**
   * Obtiene todas las notificaciones del usuario
   */
  getAll(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl);
  }

  /**
   * Obtiene solo notificaciones no leídas
   */
  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/unread`);
  }

  /**
   * Obtiene una notificación por ID
   */
  getById(id: number): Observable<Notification> {
    return this.http.get<Notification>(`${this.baseUrl}/${id}`);
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: number): Observable<Notification> {
    return this.http.patch<Notification>(`${this.baseUrl}/${id}/read`, {});
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/read-all`, {});
  }

  /**
   * Elimina una notificación
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  /**
   * Elimina todas las notificaciones leídas
   */
  deleteAllRead(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/read`);
  }
}
