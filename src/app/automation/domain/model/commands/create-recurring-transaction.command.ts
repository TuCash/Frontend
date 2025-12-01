/**
 * Automation Bounded Context - Domain Layer
 * CreateRecurringTransaction Command
 */

export class CreateRecurringTransactionCommand {
  constructor(
    public accountId: number,
    public categoryId: number,
    public type: 'INCOME' | 'EXPENSE',
    public amount: number,
    public description: string,
    public frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    public startDate: string,
    public endDate: string | null
  ) {}
}
