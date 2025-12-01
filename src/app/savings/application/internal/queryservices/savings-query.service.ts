/**
 * Savings Bounded Context - Application Layer
 * Savings Query Service
 * Maneja operaciones de lectura (get goals, budgets)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { GetAllGoalsQuery } from '../../../domain/model/queries/get-all-goals.query';
import { GetAllBudgetsQuery } from '../../../domain/model/queries/get-all-budgets.query';
import { GoalResource } from '../../../presentation/resources/goal.resource';
import { BudgetResource } from '../../../presentation/resources/budget.resource';

@Injectable({ providedIn: 'root' })
export class SavingsQueryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ============================================
  // GOAL QUERIES
  // ============================================

  handleGetAllGoals(query: GetAllGoalsQuery): Observable<GoalResource[]> {
    return this.http.get<GoalResource[]>(`${this.baseUrl}${environment.endpoints.goals}`);
  }

  handleGetGoalById(goalId: number): Observable<GoalResource> {
    return this.http.get<GoalResource>(`${this.baseUrl}${environment.endpoints.goals}/${goalId}`);
  }

  // ============================================
  // BUDGET QUERIES
  // ============================================

  handleGetAllBudgets(query: GetAllBudgetsQuery): Observable<BudgetResource[]> {
    return this.http.get<BudgetResource[]>(`${this.baseUrl}${environment.endpoints.budgets}`);
  }

  handleGetBudgetById(budgetId: number): Observable<BudgetResource> {
    return this.http.get<BudgetResource>(
      `${this.baseUrl}${environment.endpoints.budgets}/${budgetId}`
    );
  }
}
