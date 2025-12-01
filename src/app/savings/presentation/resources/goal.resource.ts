/**
 * Savings Bounded Context - Presentation Layer
 * Goal Resource (DTO)
 */

export interface GoalResource {
  id: number;
  userId: number;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}
