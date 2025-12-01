/**
 * Notifications Bounded Context - Application Layer
 * Notification Query Service
 * Maneja operaciones de lectura (get notifications)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllNotificationsQuery } from '../../../domain/model/queries/get-all-notifications.query';
import { GetUnreadNotificationsQuery } from '../../../domain/model/queries/get-unread-notifications.query';
import { NotificationResource } from '../../../presentation/resources/notification.resource';

@Injectable({ providedIn: 'root' })
export class NotificationQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleGetAllNotifications(query: GetAllNotificationsQuery): Observable<NotificationResource[]> {
    return this.http.get<NotificationResource[]>(
      `${this.baseUrl}${environment.endpoints.notifications}`
    );
  }

  handleGetUnreadNotifications(
    query: GetUnreadNotificationsQuery
  ): Observable<NotificationResource[]> {
    return this.http.get<NotificationResource[]>(
      `${this.baseUrl}${environment.endpoints.notifications}/unread`
    );
  }

  handleGetNotificationById(notificationId: number): Observable<NotificationResource> {
    return this.http.get<NotificationResource>(
      `${this.baseUrl}${environment.endpoints.notifications}/${notificationId}`
    );
  }
}
