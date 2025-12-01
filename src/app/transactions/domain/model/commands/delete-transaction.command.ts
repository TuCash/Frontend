/**
 * Transactions Bounded Context - Domain Layer
 * DeleteTransaction Command
 */

export class DeleteTransactionCommand {
  constructor(public transactionId: number) {}
}
