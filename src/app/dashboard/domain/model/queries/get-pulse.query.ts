/**
 * Dashboard Bounded Context - Domain Layer
 * GetPulse Query
 */

export class GetPulseQuery {
  constructor(
    public fromDate?: string,
    public toDate?: string
  ) {}
}
