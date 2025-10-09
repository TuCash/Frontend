import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Goal {
  id: number;
  userId: number;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  notes?: string;
}

export interface CreateGoalPayload {
  userId: number;
  title: string;
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly baseUrl = environment.apiBaseUrl;
  private readonly endpoints = environment.endpoints;

  listGoals(userId: number): Observable<Goal[]> {
    const params = new HttpParams().set('userId', String(userId));
    return this.http.get<Goal[]>(`${this.baseUrl}${this.endpoints.goals}`, { params });
  }

  createGoal(payload: CreateGoalPayload): Observable<Goal> {
    const headers = this.buildAuthHeaders();
    return this.http.post<Goal>(`${this.baseUrl}${this.endpoints.goals}`, payload, { headers });
  }

  private buildAuthHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }
}
