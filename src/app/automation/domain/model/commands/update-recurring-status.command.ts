/**
 * Automation Bounded Context - Domain Layer
 * UpdateRecurringStatus Command
 */

export class UpdateRecurringStatusCommand {
  constructor(
    public recurringTransactionId: number,
    public isActive: boolean
  ) {}
}
