/**
 * Dashboard Bounded Context - Presentation Layer
 * Dashboard Resources (DTOs)
 */

export interface DashboardPulseResource {
  currency: string;
  periodLabel: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyTrendResource {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export interface TrendSeriesResource {
  currency: string;
  series: MonthlyTrendResource[];
}

export interface CategoryLeakResource {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface CategoryLeaksResource {
  currency: string;
  period: string;
  leaks: CategoryLeakResource[];
}
