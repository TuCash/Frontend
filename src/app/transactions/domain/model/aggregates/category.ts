/**
 * Transactions Bounded Context - Domain Layer
 * Category Aggregate Root
 */

export class Category {
  constructor(
    public id: number,
    public name: string,
    public type: 'INCOME' | 'EXPENSE',
    public icon: string,
    public color: string,
    public isSystemCategory: boolean
  ) {}
}
