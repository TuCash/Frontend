/**
 * Savings Bounded Context - Presentation Layer
 * Budgets List Component
 */

import { Component, inject, OnInit, signal, ComponentRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

import { SavingsQueryService } from '../../../application/internal/queryservices/savings-query.service';
import { SavingsCommandService } from '../../../application/internal/commandservices/savings-command.service';
import { GetAllBudgetsQuery } from '../../../domain/model/queries/get-all-budgets.query';
import { BudgetResource } from '../../resources/budget.resource';
import { ModalService } from '../../../../shared/infrastructure/services/modal.service';
import { BudgetFormComponent } from './budget-form.component';
import { TransactionQueryService } from '../../../../transactions/application/internal/queryservices/transaction-query.service';
import { CategoryResource } from '../../../../transactions/presentation/resources/category.resource';
import { TransactionResource } from '../../../../transactions/presentation/resources/transaction.resource';
import { GetAllTransactionsQuery } from '../../../../transactions/domain/model/queries/get-all-transactions.query';
import { forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-budgets-list',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './budgets-list.component.html',
  styleUrls: ['./budgets-list.component.css'],
})
export class BudgetsListComponent implements OnInit {
  private readonly savingsQueryService = inject(SavingsQueryService);
  private readonly savingsCommandService = inject(SavingsCommandService);
  private readonly transactionQueryService = inject(TransactionQueryService);
  private readonly modalService = inject(ModalService);

  // State signals
  readonly isLoading = signal(true);
  readonly loadError = signal('');
  readonly budgets = signal<BudgetResource[]>([]);
  readonly categories = signal<CategoryResource[]>([]);
  readonly transactions = signal<TransactionResource[]>([]);
  private currentModalRef?: ComponentRef<any>;

  ngOnInit(): void {
    this.loadBudgetsAndCategories();
  }

  loadBudgetsAndCategories(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    forkJoin({
      budgets: this.savingsQueryService.handleGetAllBudgets(new GetAllBudgetsQuery()),
      categories: this.transactionQueryService.handleGetExpenseCategories(),
      transactions: this.transactionQueryService.handleGetAllTransactions(
        new GetAllTransactionsQuery('EXPENSE', undefined, undefined, undefined, 0, 1000)
      ).pipe(map(response => response.content))
    }).subscribe({
      next: ({ budgets, categories, transactions }) => {
        console.log('✅ Budgets loaded:', budgets);
        console.log('✅ Categories loaded:', categories);
        console.log('✅ Transactions loaded:', transactions);

        // Calculate spent amount for each budget based on transactions
        const budgetsWithCalculatedSpent = budgets.map(budget => {
          const spent = this.calculateSpentForBudget(budget, transactions);
          return { ...budget, spent };
        });

        this.budgets.set(budgetsWithCalculatedSpent);
        this.categories.set(categories);
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading budgets or categories:', error);
        this.loadError.set('budgets.errors.loadBudgets');
        this.isLoading.set(false);
      },
    });
  }

  loadBudgets(): void {
    this.loadBudgetsAndCategories();
  }

  /**
   * Calculate spent amount for a budget based on transactions
   * Sums all EXPENSE transactions that match the budget's category and date range
   */
  private calculateSpentForBudget(budget: BudgetResource, transactions: TransactionResource[]): number {
    const budgetStart = new Date(budget.startDate);
    const budgetEnd = new Date(budget.endDate);

    // Filter transactions that match the budget's category and are within the date range
    const matchingTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transactionDate);
      return (
        transaction.categoryId === budget.categoryId &&
        transactionDate >= budgetStart &&
        transactionDate <= budgetEnd
      );
    });

    // Sum the amounts
    const totalSpent = matchingTransactions.reduce((sum, transaction) => {
      return sum + (transaction.amount || 0);
    }, 0);

    console.log(`💰 Budget #${budget.id} (Category #${budget.categoryId}): ${matchingTransactions.length} transactions, spent: ${totalSpent}`);
    return totalSpent;
  }

  deleteBudget(budgetId: number): void {
    if (!confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return;
    }

    this.savingsCommandService.handleDeleteBudget(budgetId).subscribe({
      next: () => {
        console.log('✅ Budget deleted');
        this.loadBudgets();
      },
      error: (error) => {
        console.error('❌ Error deleting budget:', error);
        alert('Error al eliminar el presupuesto');
      },
    });
  }

  // Helper methods
  getSpentPercentage(budget: BudgetResource): number {
    if (!budget.limitAmount || budget.limitAmount === 0) return 0;
    const spent = budget.spent || 0;
    return Math.min(Math.round((spent / budget.limitAmount) * 100), 100);
  }

  getProgressClass(percentage: number): string {
    if (percentage >= 100) return 'progress-exceeded';
    if (percentage >= 90) return 'progress-warning';
    if (percentage >= 75) return 'progress-high';
    if (percentage >= 50) return 'progress-medium';
    return 'progress-low';
  }

  getRemainingAmount(budget: BudgetResource): number {
    return Math.max(budget.limitAmount - budget.spent, 0);
  }

  getDaysRemaining(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  formatAmount(amount: number): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return 'S/0.00';
    }
    return `S/${amount.toFixed(2)}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getPeriodLabel(period: string): string {
    const labels: Record<string, string> = {
      'WEEKLY': 'Semanal',
      'MONTHLY': 'Mensual',
      'YEARLY': 'Anual'
    };
    return labels[period] || period;
  }

  getCategoryById(categoryId: number): CategoryResource | undefined {
    return this.categories().find(cat => cat.id === categoryId);
  }

  getCategoryName(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category ? category.name : `Categoría #${categoryId}`;
  }

  getCategoryIcon(categoryId: number): string {
    const category = this.getCategoryById(categoryId);
    return category ? category.icon : '📊';
  }

  // Modal methods
  openNewBudgetModal(): void {
    this.openBudgetModal();
  }

  private openBudgetModal(): void {
    const modalData = {
      isModal: true,
      onClose: () => this.closeModal(),
      onSuccess: () => {
        this.closeModal();
        this.loadBudgets();
      },
    };

    this.currentModalRef = this.modalService.open(BudgetFormComponent, modalData);
  }

  private closeModal(): void {
    if (this.currentModalRef) {
      this.modalService.close(this.currentModalRef);
      this.currentModalRef = undefined;
    }
  }
}
