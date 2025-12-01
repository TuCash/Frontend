/**
 * Transactions Bounded Context - Presentation Layer
 * Transaction Resources (DTOs)
 */

export interface TransactionResource {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string | null;
  transactionDate: string;
  goalId: number | null;
  goalName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  accountId: number;
  categoryId: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  description: string;
  transactionDate: string;
}

export interface UpdateTransactionRequest {
  accountId: number;
  categoryId: number;
  amount: number;
  description: string;
  transactionDate: string;
}
