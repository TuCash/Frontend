/**
 * Notifications Bounded Context - Domain Layer
 * Notification Aggregate Root
 */

export class Notification {
  constructor(
    public id: number,
    public type: 'INFO' | 'WARNING' | 'GOAL' | 'BUDGET',
    public title: string,
    public message: string,
    public isRead: boolean,
    public createdAt: string
  ) {}
}
