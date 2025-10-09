import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

export interface Income {
  id: number;
  userId: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  recurring?: boolean;
}

export interface CreateIncomePayload {
  userId: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string;
  recurring?: boolean;
}

@Injectable({ providedIn: 'root' })
export class IncomeService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  private readonly baseUrl = environment.apiBaseUrl;
  private readonly endpoints = environment.endpoints;

  listIncomes(userId: number): Observable<Income[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Income[]>(`${this.baseUrl}${this.endpoints.incomes}`, { params });
  }

  listExpenses(userId: number): Observable<Income[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Income[]>(`${this.baseUrl}${this.endpoints.expenses}`, { params });
  }

  createIncome(payload: CreateIncomePayload): Observable<Income> {
    const headers = this.buildAuthHeaders();
    return this.http.post<Income>(`${this.baseUrl}${this.endpoints.incomes}`, payload, {
      headers,
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    const headers = this.authService.getAuthHeaders();
    return headers;
  }
}
