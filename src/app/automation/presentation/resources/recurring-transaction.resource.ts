/**
 * Automation Bounded Context - Presentation Layer
 * RecurringTransaction Resources (DTOs)
 */

export interface RecurringTransactionResource {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string | null;
  nextExecutionDate: string;
  isActive: boolean;
}

export interface CreateRecurringTransactionRequest {
  accountId: number;
  categoryId: number;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  description: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate: string;
  endDate: string | null;
}

export interface UpdateRecurringStatusRequest {
  isActive: boolean;
}
