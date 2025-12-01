/**
 * Dashboard Bounded Context - Domain Layer
 * DashboardPulse Value Object
 */

export class DashboardPulse {
  constructor(
    public currency: string,
    public periodLabel: string,
    public totalIncome: number,
    public totalExpenses: number,
    public balance: number,
    public savingsRate: number
  ) {}
}
