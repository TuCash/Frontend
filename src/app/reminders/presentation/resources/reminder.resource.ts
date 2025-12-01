/**
 * Reminders Bounded Context - Presentation Layer
 * Reminder Resources (DTOs)
 */

export interface ReminderResource {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateReminderRequest {
  title: string;
  description: string;
  dueDate: string;
}
