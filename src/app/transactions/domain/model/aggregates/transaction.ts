/**
 * Transactions Bounded Context - Domain Layer
 * Transaction Aggregate Root
 */

export class Transaction {
  constructor(
    public id: number,
    public accountId: number,
    public accountName: string,
    public categoryId: number,
    public categoryName: string,
    public categoryIcon: string,
    public type: 'INCOME' | 'EXPENSE' | 'TRANSFER',
    public amount: number,
    public description: string | null,
    public transactionDate: string,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
