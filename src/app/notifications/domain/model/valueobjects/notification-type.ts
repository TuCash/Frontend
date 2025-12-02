/**
 * Notifications Bounded Context - Domain Layer
 * NotificationType Value Object (Enum)
 * Alineado con el backend: NotificationType.java
 */

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  REMINDER = 'REMINDER',
  BUDGET_ALERT = 'BUDGET_ALERT',
  GOAL_ACHIEVED = 'GOAL_ACHIEVED',
}
