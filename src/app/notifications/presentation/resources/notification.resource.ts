/**
 * Notifications Bounded Context - Presentation Layer
 * Notification Resources (DTOs)
 */

export interface NotificationResource {
  id: number;
  type: 'INFO' | 'WARNING' | 'GOAL' | 'BUDGET';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
