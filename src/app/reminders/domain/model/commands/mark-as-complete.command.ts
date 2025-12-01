/**
 * Reminders Bounded Context - Domain Layer
 * MarkAsComplete Command
 */

export class MarkAsCompleteCommand {
  constructor(public reminderId: number) {}
}
