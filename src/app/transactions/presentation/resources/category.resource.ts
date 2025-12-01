/**
 * Transactions Bounded Context - Presentation Layer
 * Category Resources (DTOs)
 */

export interface CategoryResource {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isSystemCategory: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
}
