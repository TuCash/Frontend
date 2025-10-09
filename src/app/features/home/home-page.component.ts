import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { HomeService, Transaction } from './home.service';
import { forkJoin } from 'rxjs';

interface DashboardTotals {
  incomes: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

interface TransactionView extends Transaction {
  type: 'income' | 'expense';
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [ TranslateModule, RouterLink, CommonModule],
  templateUrl: 'home-page.component.html',
  styleUrls: ['home-page.component.css'],
})
export class HomePageComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly homeService = inject(HomeService);

  readonly authUser = this.authService.getCurrentUser();

  totals: DashboardTotals = {
    incomes: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  };

  recentTransactions: TransactionView[] = [];
  counts = { incomes: 0, expenses: 0 };
  isLoading = true;
  loadError = '';
  readonly currency = 'S/'; // Placeholder currency symbol (could come from profile later)
  netFlowAbsolute = 0;
  chartData = {
    incomesPercent: 0,
    expensesPercent: 0,
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.isLoading = true;
    this.loadError = '';

    forkJoin({
      incomes: this.homeService.getIncomes(),
      expenses: this.homeService.getExpenses(),
    }).subscribe({
      next: ({ incomes, expenses }) => {
        const filteredIncomes = this.filterByUser(incomes);
        const filteredExpenses = this.filterByUser(expenses);

        this.computeTotals(filteredIncomes, filteredExpenses);
        this.mapRecentTransactions(filteredIncomes, filteredExpenses);
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Failed to load dashboard data', error);
        this.isLoading = false;
        this.loadError = 'home.errors.loadData';
      },
    });
  }

  reload(): void {
    this.loadDashboardData();
  }

  private computeTotals(incomes: Transaction[], expenses: Transaction[]): void {
    const incomesTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
    const expensesTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = incomesTotal - expensesTotal;
    const savingsRate = incomesTotal === 0 ? 0 : (balance / incomesTotal) * 100;

    this.totals = {
      incomes: incomesTotal,
      expenses: expensesTotal,
      balance,
      savingsRate,
    };

    this.counts = {
      incomes: incomes.length,
      expenses: expenses.length,
    };

    this.netFlowAbsolute = Math.abs(incomesTotal - expensesTotal);
    this.computeChartData(incomesTotal, expensesTotal);
  }

  private mapRecentTransactions(incomes: Transaction[], expenses: Transaction[]): void {
    const transactions: TransactionView[] = [
      ...incomes.map(item => ({ ...item, type: 'income' as const })),
      ...expenses.map(item => ({ ...item, type: 'expense' as const })),
    ];

    this.recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  formatAmount(amount: number, withSign = false): string {
    const formatter = new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
    });

    const formatted = formatter.format(Math.abs(amount));
    if (!withSign) {
      return formatted.replace('PEN', this.currency).trim();
    }

    const sign = amount >= 0 ? '+' : '-';
    return `${sign}${formatted.replace('PEN', this.currency).trim()}`;
  }

  formatDate(date: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  }

  private filterByUser(transactions: Transaction[]): Transaction[] {
    const userId = this.authUser?.id;
    if (!userId) {
      return transactions;
    }

    return transactions.filter(item => item.userId === userId);
  }

  private computeChartData(incomesTotal: number, expensesTotal: number): void {
    const total = incomesTotal + expensesTotal;
    if (total === 0) {
      this.chartData = { incomesPercent: 50, expensesPercent: 50 };
      return;
    }

    const incomesPercent = Math.round((incomesTotal / total) * 100);
    const expensesPercent = 100 - incomesPercent;

    this.chartData = {
      incomesPercent,
      expensesPercent,
    };
  }
}
