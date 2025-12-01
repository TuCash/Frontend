/**
 * Dashboard Bounded Context - Domain Layer
 * TrendSeries Value Object
 */

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

export class TrendSeries {
  constructor(
    public currency: string,
    public series: MonthlyTrend[]
  ) {}
}
