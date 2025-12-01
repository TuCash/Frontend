/**
 * Savings Bounded Context - Domain Layer
 * Budget Aggregate Root
 */

export class Budget {
  constructor(
    public id: number,
    public categoryId: number,
    public categoryName: string,
    public limitAmount: number,
    public spentAmount: number,
    public remainingAmount: number,
    public spentPercentage: number,
    public period: 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    public startDate: string,
    public endDate: string,
    public isWarning: boolean,
    public isExceeded: boolean,
    public isActive: boolean,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
