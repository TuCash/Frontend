/**
 * Reminders Bounded Context - Domain Layer
 * Reminder Aggregate Root
 */

export class Reminder {
  constructor(
    public id: number,
    public title: string,
    public description: string,
    public dueDate: string,
    public isCompleted: boolean,
    public createdAt: string
  ) {}
}
