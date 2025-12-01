/**
 * Dashboard Bounded Context - Domain Layer
 * GetLeaks Query
 */

export class GetLeaksQuery {
  constructor(
    public fromDate?: string,
    public toDate?: string,
    public top: number = 5
  ) {}
}
