/**
 * Notifications Bounded Context - Application Layer
 * Notification Polling Service
 * Servicio que hace polling cada 30 segundos para obtener notificaciones no leídas
 */

import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, startWith, switchMap, catchError, of, map } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { NotificationResource, PagedResponse } from '../../../presentation/resources/notification.resource';

@Injectable({ providedIn: 'root' })
export class NotificationPollingService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}${environment.endpoints.notifications}`;

  // Signals para el estado
  private readonly _unreadNotifications = signal<NotificationResource[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string | null>(null);

  // Exponer signals como readonly
  readonly unreadNotifications = this._unreadNotifications.asReadonly();
  readonly unreadCount = computed(() => this._unreadNotifications().length);
  readonly hasUnread = computed(() => this._unreadNotifications().length > 0);
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();

  private pollingSubscription?: Subscription;
  private readonly POLLING_INTERVAL = 30000; // 30 segundos

  /**
   * Inicia el polling de notificaciones
   */
  startPolling(): void {
    if (this.pollingSubscription) {
      return; // Ya está activo
    }

    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        startWith(0), // Ejecutar inmediatamente
        switchMap(() => this.fetchUnreadNotifications())
      )
      .subscribe();
  }

  /**
   * Detiene el polling de notificaciones
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Fuerza una actualización inmediata
   */
  refresh(): void {
    this.fetchUnreadNotifications().subscribe();
  }

  /**
   * Obtiene las notificaciones no leídas del servidor
   * El backend devuelve una respuesta paginada de Spring Boot
   */
  private fetchUnreadNotifications() {
    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<PagedResponse<NotificationResource>>(`${this.baseUrl}/unread`).pipe(
      map(response => {
        // Extraer el array content de la respuesta paginada
        const notifications = response.content || [];
        this._unreadNotifications.set(notifications);
        this._isLoading.set(false);
        return notifications;
      }),
      catchError(error => {
        console.error('Error fetching notifications:', error);
        this._error.set('Error al cargar notificaciones');
        this._isLoading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Marca una notificación como leída y actualiza el estado
   */
  markAsRead(notificationId: number): void {
    this.http.patch<NotificationResource>(`${this.baseUrl}/${notificationId}/read`, {}).subscribe({
      next: () => {
        // Remover de la lista de no leídas
        this._unreadNotifications.update(notifications =>
          notifications.filter(n => n.id !== notificationId)
        );
      },
      error: err => console.error('Error marking notification as read:', err)
    });
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  markAllAsRead(): void {
    // El backend no tiene endpoint para marcar todas como leídas
    // Lo hacemos una por una
    const notifications = this._unreadNotifications();
    notifications.forEach(notification => {
      this.http.patch<NotificationResource>(`${this.baseUrl}/${notification.id}/read`, {}).subscribe({
        error: err => console.error('Error marking notification as read:', err)
      });
    });
    this._unreadNotifications.set([]);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
