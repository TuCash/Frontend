/**
 * Transactions Bounded Context - Domain Layer
 * CreateCategory Command
 */

export class CreateCategoryCommand {
  constructor(
    public name: string,
    public type: 'INCOME' | 'EXPENSE',
    public icon?: string,
    public color?: string
  ) {}
}
