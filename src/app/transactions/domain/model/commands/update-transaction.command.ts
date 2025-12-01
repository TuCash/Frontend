/**
 * Transactions Bounded Context - Domain Layer
 * UpdateTransaction Command
 */

export class UpdateTransactionCommand {
  constructor(
    public transactionId: number,
    public accountId: number,
    public categoryId: number,
    public amount: number,
    public description: string,
    public transactionDate: string
  ) {}
}
