/**
 * Transactions Bounded Context - Application Layer
 * Transaction Query Service
 * Maneja operaciones de lectura (get accounts, categories, transactions)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllAccountsQuery } from '../../../domain/model/queries/get-all-accounts.query';
import { GetAllCategoriesQuery } from '../../../domain/model/queries/get-all-categories.query';
import { GetAllTransactionsQuery } from '../../../domain/model/queries/get-all-transactions.query';
import { AccountResource } from '../../../presentation/resources/account.resource';
import { CategoryResource } from '../../../presentation/resources/category.resource';
import { TransactionResource } from '../../../presentation/resources/transaction.resource';

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
}

@Injectable({ providedIn: 'root' })
export class TransactionQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ============================================
  // ACCOUNT QUERIES
  // ============================================

  handleGetAllAccounts(query: GetAllAccountsQuery): Observable<AccountResource[]> {
    return this.http.get<AccountResource[]>(`${this.baseUrl}${environment.endpoints.accounts}`);
  }

  handleGetAccountById(accountId: number): Observable<AccountResource> {
    return this.http.get<AccountResource>(
      `${this.baseUrl}${environment.endpoints.accounts}/${accountId}`
    );
  }

  // ============================================
  // CATEGORY QUERIES
  // ============================================

  handleGetAllCategories(query: GetAllCategoriesQuery): Observable<CategoryResource[]> {
    let params = new HttpParams();
    if (query.type) {
      params = params.set('type', query.type);
    }

    return this.http.get<CategoryResource[]>(
      `${this.baseUrl}${environment.endpoints.categories}`,
      { params }
    );
  }

  handleGetIncomeCategories(): Observable<CategoryResource[]> {
    return this.handleGetAllCategories(new GetAllCategoriesQuery('INCOME'));
  }

  handleGetExpenseCategories(): Observable<CategoryResource[]> {
    return this.handleGetAllCategories(new GetAllCategoriesQuery('EXPENSE'));
  }

  // ============================================
  // TRANSACTION QUERIES
  // ============================================

  handleGetAllTransactions(
    query: GetAllTransactionsQuery
  ): Observable<PaginatedResponse<TransactionResource>> {
    let params = new HttpParams();

    if (query.type) params = params.set('type', query.type);
    if (query.categoryId) params = params.set('categoryId', query.categoryId.toString());
    if (query.accountId) params = params.set('accountId', query.accountId.toString());
    if (query.fromDate) params = params.set('fromDate', query.fromDate);
    if (query.toDate) params = params.set('toDate', query.toDate);
    params = params.set('page', query.page.toString());
    params = params.set('size', query.size.toString());

    return this.http.get<PaginatedResponse<TransactionResource>>(
      `${this.baseUrl}${environment.endpoints.transactions}`,
      { params }
    );
  }

  handleGetIncomes(
    fromDate?: string,
    toDate?: string,
    page: number = 0,
    size: number = 20
  ): Observable<PaginatedResponse<TransactionResource>> {
    return this.handleGetAllTransactions(
      new GetAllTransactionsQuery('INCOME', undefined, fromDate, toDate, page, size)
    );
  }

  handleGetExpenses(
    fromDate?: string,
    toDate?: string,
    page: number = 0,
    size: number = 20
  ): Observable<PaginatedResponse<TransactionResource>> {
    return this.handleGetAllTransactions(
      new GetAllTransactionsQuery('EXPENSE', undefined, fromDate, toDate, page, size)
    );
  }

  handleGetTransactionById(transactionId: number): Observable<TransactionResource> {
    return this.http.get<TransactionResource>(
      `${this.baseUrl}${environment.endpoints.transactions}/${transactionId}`
    );
  }
}
