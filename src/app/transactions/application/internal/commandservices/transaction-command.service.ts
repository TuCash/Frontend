/**
 * Transactions Bounded Context - Application Layer
 * Transaction Command Service
 * Maneja operaciones de escritura (create, update, delete)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateAccountCommand } from '../../../domain/model/commands/create-account.command';
import { CreateCategoryCommand } from '../../../domain/model/commands/create-category.command';
import { CreateTransactionCommand } from '../../../domain/model/commands/create-transaction.command';
import { UpdateTransactionCommand } from '../../../domain/model/commands/update-transaction.command';
import { DeleteTransactionCommand } from '../../../domain/model/commands/delete-transaction.command';
import { AccountResource } from '../../../presentation/resources/account.resource';
import { CategoryResource } from '../../../presentation/resources/category.resource';
import { TransactionResource } from '../../../presentation/resources/transaction.resource';

@Injectable({ providedIn: 'root' })
export class TransactionCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ============================================
  // ACCOUNT COMMANDS
  // ============================================

  handleCreateAccount(command: CreateAccountCommand): Observable<AccountResource> {
    return this.http.post<AccountResource>(`${this.baseUrl}${environment.endpoints.accounts}`, {
      name: command.name,
      currency: command.currency,
    });
  }

  handleDeleteAccount(accountId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.accounts}/${accountId}`);
  }

  // ============================================
  // CATEGORY COMMANDS
  // ============================================

  handleCreateCategory(command: CreateCategoryCommand): Observable<CategoryResource> {
    return this.http.post<CategoryResource>(`${this.baseUrl}${environment.endpoints.categories}`, {
      name: command.name,
      type: command.type,
      icon: command.icon,
      color: command.color,
    });
  }

  handleDeleteCategory(categoryId: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.endpoints.categories}/${categoryId}`
    );
  }

  // ============================================
  // TRANSACTION COMMANDS
  // ============================================

  handleCreateTransaction(command: CreateTransactionCommand): Observable<TransactionResource> {
    return this.http.post<TransactionResource>(
      `${this.baseUrl}${environment.endpoints.transactions}`,
      {
        accountId: command.accountId,
        categoryId: command.categoryId,
        type: command.type,
        amount: command.amount,
        description: command.description,
        transactionDate: command.transactionDate,
      }
    );
  }

  handleUpdateTransaction(command: UpdateTransactionCommand): Observable<TransactionResource> {
    return this.http.put<TransactionResource>(
      `${this.baseUrl}${environment.endpoints.transactions}/${command.transactionId}`,
      {
        accountId: command.accountId,
        categoryId: command.categoryId,
        amount: command.amount,
        description: command.description,
        transactionDate: command.transactionDate,
      }
    );
  }

  handleDeleteTransaction(command: DeleteTransactionCommand): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.endpoints.transactions}/${command.transactionId}`
    );
  }
}
