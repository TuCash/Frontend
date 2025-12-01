/**
 * Savings Bounded Context - Presentation Layer
 * Budget Resource (DTO)
 */

export interface BudgetResource {
  id: number;
  userId: number;
  categoryId: number;
  limitAmount: number;
  spent: number;
  period: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}
