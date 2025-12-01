/**
 * Reminders Bounded Context - Application Layer
 * Reminder Query Service
 * Maneja operaciones de lectura (get reminders)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllRemindersQuery } from '../../../domain/model/queries/get-all-reminders.query';
import { ReminderResource } from '../../../presentation/resources/reminder.resource';

@Injectable({ providedIn: 'root' })
export class ReminderQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleGetAllReminders(query: GetAllRemindersQuery): Observable<ReminderResource[]> {
    return this.http.get<ReminderResource[]>(`${this.baseUrl}${environment.endpoints.reminders}`);
  }

  handleGetReminderById(reminderId: number): Observable<ReminderResource> {
    return this.http.get<ReminderResource>(
      `${this.baseUrl}${environment.endpoints.reminders}/${reminderId}`
    );
  }
}
