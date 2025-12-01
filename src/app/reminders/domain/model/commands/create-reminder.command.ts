/**
 * Reminders Bounded Context - Domain Layer
 * CreateReminder Command
 */

export class CreateReminderCommand {
  constructor(
    public title: string,
    public description: string,
    public dueDate: string
  ) {}
}
