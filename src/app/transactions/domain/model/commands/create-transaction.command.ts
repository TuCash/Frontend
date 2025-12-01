/**
 * Transactions Bounded Context - Domain Layer
 * CreateTransaction Command
 */

export class CreateTransactionCommand {
  constructor(
    public accountId: number,
    public categoryId: number,
    public type: 'INCOME' | 'EXPENSE' | 'TRANSFER',
    public amount: number,
    public description: string,
    public transactionDate: string
  ) {}
}
