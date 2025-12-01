/**
 * Savings Bounded Context - Domain Layer
 * Create Budget Command
 */

export class CreateBudgetCommand {
  constructor(
    public categoryId: number,
    public limitAmount: number,
    public period: string,
    public startDate: string,
    public endDate: string
  ) {}
}
