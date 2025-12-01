/**
 * Savings Bounded Context - Domain Layer
 * Command to add a contribution to a savings goal
 */
export class ContributeToGoalCommand {
  constructor(
    public goalId: number,
    public accountId: number,
    public amount: number,
    public description?: string
  ) {}
}
