import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface Transaction {
  id: number;
  userId: number;
  description: string;
  category: string;
  amount: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly endpoints = environment.endpoints;

  getIncomes(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}${this.endpoints.incomes}`);
  }

  getExpenses(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${this.baseUrl}${this.endpoints.expenses}`);
  }
}
