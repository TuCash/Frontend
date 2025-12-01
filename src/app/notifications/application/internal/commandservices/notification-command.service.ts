/**
 * Notifications Bounded Context - Application Layer
 * Notification Command Service
 * Maneja operaciones de escritura (mark as read, delete)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { MarkAsReadCommand } from '../../../domain/model/commands/mark-as-read.command';
import { NotificationResource } from '../../../presentation/resources/notification.resource';

@Injectable({ providedIn: 'root' })
export class NotificationCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleMarkAsRead(command: MarkAsReadCommand): Observable<NotificationResource> {
    return this.http.patch<NotificationResource>(
      `${this.baseUrl}${environment.endpoints.notifications}/${command.notificationId}/read`,
      {}
    );
  }

  handleDeleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.endpoints.notifications}/${notificationId}`
    );
  }
}
