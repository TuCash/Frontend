/**
 * Savings Bounded Context - Domain Layer
 * CreateGoal Command
 */

export class CreateGoalCommand {
  constructor(
    public name: string,
    public description: string,
    public targetAmount: number,
    public deadline: string
  ) {}
}
