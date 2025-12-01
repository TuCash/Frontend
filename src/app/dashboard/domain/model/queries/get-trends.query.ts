/**
 * Dashboard Bounded Context - Domain Layer
 * GetTrends Query
 */

export class GetTrendsQuery {
  constructor(public months: number = 6) {}
}
