/**
 * Notifications Bounded Context - Infrastructure Layer
 * Notification Repository Service
 * Gestión de notificaciones via HTTP
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { NotificationResource, PagedResponse } from '../../presentation/resources/notification.resource';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.notifications}`;

  /**
   * Obtiene todas las notificaciones del usuario
   * Backend puede devolver array o respuesta paginada
   */
  getAll(): Observable<NotificationResource[]> {
    return this.http.get<NotificationResource[] | PagedResponse<NotificationResource>>(this.baseUrl).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        // Handle Spring Boot paginated response
        return response.content || [];
      })
    );
  }

  /**
   * Obtiene solo notificaciones no leídas
   */
  getUnread(): Observable<NotificationResource[]> {
    return this.http.get<NotificationResource[] | PagedResponse<NotificationResource>>(`${this.baseUrl}/unread`).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }
        return response.content || [];
      })
    );
  }

  /**
   * Obtiene una notificación por ID
   */
  getById(id: number): Observable<NotificationResource> {
    return this.http.get<NotificationResource>(`${this.baseUrl}/${id}`);
  }

  /**
   * Marca una notificación como leída
   */
  markAsRead(id: number): Observable<NotificationResource> {
    return this.http.patch<NotificationResource>(`${this.baseUrl}/${id}/read`, {});
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
