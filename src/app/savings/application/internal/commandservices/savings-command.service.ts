/**
 * Savings Bounded Context - Application Layer
 * Savings Command Service
 * Maneja operaciones de escritura (create goal/budget, update progress, celebrate)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { CreateGoalCommand } from '../../../domain/model/commands/create-goal.command';
import { UpdateGoalProgressCommand } from '../../../domain/model/commands/update-goal-progress.command';
import { CelebrateGoalCommand } from '../../../domain/model/commands/celebrate-goal.command';
import { ContributeToGoalCommand } from '../../../domain/model/commands/contribute-to-goal.command';
import { CreateBudgetCommand } from '../../../domain/model/commands/create-budget.command';
import { GoalResource } from '../../../presentation/resources/goal.resource';
import { BudgetResource } from '../../../presentation/resources/budget.resource';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';

@Injectable({ providedIn: 'root' })
export class SavingsCommandService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ============================================
  // GOAL COMMANDS
  // ============================================

  handleCreateGoal(command: CreateGoalCommand): Observable<GoalResource> {
    return this.http.post<GoalResource>(`${this.baseUrl}${environment.endpoints.goals}`, {
      name: command.name,
      description: command.description,
      targetAmount: command.targetAmount,
      deadline: command.deadline,
    });
  }

  handleUpdateGoalProgress(command: UpdateGoalProgressCommand): Observable<GoalResource> {
    return this.http.patch<GoalResource>(
      `${this.baseUrl}${environment.endpoints.goals}/${command.goalId}/progress`,
      {
        currentAmount: command.currentAmount,
      }
    );
  }

  handleCelebrateGoal(command: CelebrateGoalCommand): Observable<GoalResource> {
    return this.http.post<GoalResource>(
      `${this.baseUrl}${environment.endpoints.goals}/${command.goalId}/celebrate`,
      {}
    );
  }

  handleDeleteGoal(goalId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.goals}/${goalId}`);
  }

  // ============================================
  // GOAL CONTRIBUTIONS
  // ============================================

  handleContributeToGoal(command: ContributeToGoalCommand): Observable<TransactionResource> {
    return this.http.post<TransactionResource>(
      `${this.baseUrl}${environment.endpoints.goals}/${command.goalId}/contributions`,
      {
        accountId: command.accountId,
        amount: command.amount,
        description: command.description,
      }
    );
  }

  handleGetGoalContributions(goalId: number): Observable<TransactionResource[]> {
    return this.http.get<TransactionResource[]>(
      `${this.baseUrl}${environment.endpoints.goals}/${goalId}/contributions`
    );
  }

  handleRevertContribution(goalId: number, transactionId: number): Observable<TransactionResource> {
    return this.http.delete<TransactionResource>(
      `${this.baseUrl}${environment.endpoints.goals}/${goalId}/contributions/${transactionId}`
    );
  }

  // ============================================
  // BUDGET COMMANDS
  // ============================================

  handleCreateBudget(command: CreateBudgetCommand): Observable<BudgetResource> {
    return this.http.post<BudgetResource>(`${this.baseUrl}${environment.endpoints.budgets}`, {
      categoryId: command.categoryId,
      limitAmount: command.limitAmount,
      period: command.period,
      startDate: command.startDate,
      endDate: command.endDate,
    });
  }

  handleDeleteBudget(budgetId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}${environment.endpoints.budgets}/${budgetId}`);
  }
}
