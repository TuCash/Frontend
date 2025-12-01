/**
 * Notifications Bounded Context - Domain Layer
 * MarkAsRead Command
 */

export class MarkAsReadCommand {
  constructor(public notificationId: number) {}
}
