/**
 * Savings Bounded Context - Domain Layer
 * Update Goal Command
 */

export class UpdateGoalCommand {
  constructor(
    public readonly goalId: number,
    public readonly targetAmount: number,
    public readonly deadline: string
  ) {}
}
