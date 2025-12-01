/**
 * Savings Bounded Context - Domain Layer
 * Update Goal Progress Command
 */

export class UpdateGoalProgressCommand {
  constructor(
    public goalId: number,
    public currentAmount: number
  ) {}
}
