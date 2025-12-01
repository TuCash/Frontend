/**
 * Dashboard Bounded Context - Domain Layer
 * CategoryLeaks Value Object
 */

export interface CategoryLeak {
  categoryId: number;
  categoryName: string;
  categoryIcon: string;
  amount: number;
  percentage: number;
  color: string;
}

export class CategoryLeaks {
  constructor(
    public currency: string,
    public period: string,
    public leaks: CategoryLeak[]
  ) {}
}
