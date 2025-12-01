/**
 * Reminders Bounded Context - Application Layer
 * Reminder Command Service
 * Maneja operaciones de escritura (create, mark complete, delete)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateReminderCommand } from '../../../domain/model/commands/create-reminder.command';
import { MarkAsCompleteCommand } from '../../../domain/model/commands/mark-as-complete.command';
import { ReminderResource } from '../../../presentation/resources/reminder.resource';

@Injectable({ providedIn: 'root' })
export class ReminderCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleCreateReminder(command: CreateReminderCommand): Observable<ReminderResource> {
    return this.http.post<ReminderResource>(`${this.baseUrl}${environment.endpoints.reminders}`, {
      title: command.title,
      description: command.description,
      dueDate: command.dueDate,
    });
  }

  handleMarkAsComplete(command: MarkAsCompleteCommand): Observable<ReminderResource> {
    return this.http.patch<ReminderResource>(
      `${this.baseUrl}${environment.endpoints.reminders}/${command.reminderId}/complete`,
      {}
    );
  }

  handleDeleteReminder(reminderId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.endpoints.reminders}/${reminderId}`
    );
  }
}
