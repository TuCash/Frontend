import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Expense {
  id: number;
  userId: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  recurring?: boolean;
}

export interface CreateExpensePayload {
  userId: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  recurring?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly endpoints = environment.endpoints;

  listExpenses(userId: number): Observable<Expense[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Expense[]>(`${this.baseUrl}${this.endpoints.expenses}`, { params });
  }

  listIncomes(userId: number): Observable<Expense[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Expense[]>(`${this.baseUrl}${this.endpoints.incomes}`, { params });
  }

  createExpense(payload: CreateExpensePayload): Observable<Expense> {
    const headers = this.buildAuthHeaders();
    return this.http.post<Expense>(`${this.baseUrl}${this.endpoints.expenses}`, payload, {
      headers,
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    const headers = this.authService.getAuthHeaders();
    return headers;
  }
}
