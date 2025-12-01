/**
 * Automation Bounded Context - Domain Layer
 * RecurringTransaction Aggregate Root
 */

export class RecurringTransaction {
  constructor(
    public id: number,
    public accountId: number,
    public accountName: string,
    public categoryId: number,
    public categoryName: string,
    public type: 'INCOME' | 'EXPENSE',
    public amount: number,
    public description: string,
    public frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY',
    public startDate: string,
    public endDate: string | null,
    public nextExecutionDate: string,
    public isActive: boolean
  ) {}
}
