/**
 * Automation Bounded Context - Application Layer
 * Automation Command Service
 * Maneja operaciones de escritura (create, update status, delete)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateRecurringTransactionCommand } from '../../../domain/model/commands/create-recurring-transaction.command';
import { UpdateRecurringStatusCommand } from '../../../domain/model/commands/update-recurring-status.command';
import { RecurringTransactionResource } from '../../../presentation/resources/recurring-transaction.resource';

@Injectable({ providedIn: 'root' })
export class AutomationCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleCreateRecurringTransaction(
    command: CreateRecurringTransactionCommand
  ): Observable<RecurringTransactionResource> {
    return this.http.post<RecurringTransactionResource>(
      `${this.baseUrl}${environment.endpoints.recurringTransactions}`,
      {
        accountId: command.accountId,
        categoryId: command.categoryId,
        type: command.type,
        amount: command.amount,
        description: command.description,
        frequency: command.frequency,
        startDate: command.startDate,
        endDate: command.endDate,
      }
    );
  }

  handleUpdateRecurringStatus(
    command: UpdateRecurringStatusCommand
  ): Observable<RecurringTransactionResource> {
    return this.http.patch<RecurringTransactionResource>(
      `${this.baseUrl}${environment.endpoints.recurringTransactions}/${command.recurringTransactionId}/status`,
      {
        isActive: command.isActive,
      }
    );
  }

  handleDeleteRecurringTransaction(recurringTransactionId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.endpoints.recurringTransactions}/${recurringTransactionId}`
    );
  }
}
