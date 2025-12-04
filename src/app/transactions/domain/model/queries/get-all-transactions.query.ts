/**
 * Transactions Bounded Context - Domain Layer
 * GetAllTransactions Query
 */

export class GetAllTransactionsQuery {
  constructor(
    public type?: 'INCOME' | 'EXPENSE' | 'TRANSFER',
    public categoryId?: number,
    public fromDate?: string,
    public toDate?: string,
    public page: number = 0,
    public size: number = 20,
    public accountId?: number
  ) {}
}
