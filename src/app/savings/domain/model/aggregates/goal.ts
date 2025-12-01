/**
 * Savings Bounded Context - Domain Layer
 * Goal Aggregate Root
 */

export class Goal {
  constructor(
    public id: number,
    public name: string,
    public description: string | null,
    public targetAmount: number,
    public currentAmount: number,
    public progressPercentage: number,
    public deadline: string,
    public status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED',
    public celebratedAt: string | null,
    public createdAt: string,
    public updatedAt: string
  ) {}
}
