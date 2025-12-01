/**
 * Automation Bounded Context - Application Layer
 * Automation Query Service
 * Maneja operaciones de lectura (get recurring transactions)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllRecurringTransactionsQuery } from '../../../domain/model/queries/get-all-recurring-transactions.query';
import { RecurringTransactionResource } from '../../../presentation/resources/recurring-transaction.resource';

@Injectable({ providedIn: 'root' })
export class AutomationQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  handleGetAllRecurringTransactions(
    query: GetAllRecurringTransactionsQuery
  ): Observable<RecurringTransactionResource[]> {
    return this.http.get<RecurringTransactionResource[]>(
      `${this.baseUrl}${environment.endpoints.recurringTransactions}`
    );
  }

  handleGetRecurringTransactionById(
    recurringTransactionId: number
  ): Observable<RecurringTransactionResource> {
    return this.http.get<RecurringTransactionResource>(
      `${this.baseUrl}${environment.endpoints.recurringTransactions}/${recurringTransactionId}`
    );
  }
}
