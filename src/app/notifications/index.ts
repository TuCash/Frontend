/**
 * Notifications Bounded Context - Public API
 * Barrel export para el bounded context Notifications
 */

// Domain - Aggregates
export * from './domain/model/aggregates/notification';

// Domain - Value Objects
export * from './domain/model/valueobjects/notification-type';

// Domain - Commands
export * from './domain/model/commands/mark-as-read.command';

// Domain - Queries
export * from './domain/model/queries/get-all-notifications.query';
export * from './domain/model/queries/get-unread-notifications.query';

// Application - Services
export * from './application/internal/commandservices/notification-command.service';
export * from './application/internal/queryservices/notification-query.service';
export * from './application/internal/queryservices/notification-polling.service';

// Presentation - Resources
export type { NotificationResource, PagedResponse } from './presentation/resources/notification.resource';

// Presentation - Components
export * from './presentation/components/notification-badge/notification-badge.component';

// Presentation - Routes
export * from './presentation/notifications.routes';
