/**
 * Reminders Bounded Context - Public API
 * Barrel export para el bounded context Reminders
 */

// Domain - Aggregates
export * from './domain/model/aggregates/reminder';

// Domain - Commands
export * from './domain/model/commands/create-reminder.command';
export * from './domain/model/commands/mark-as-complete.command';

// Domain - Queries
export * from './domain/model/queries/get-all-reminders.query';

// Application - Services
export * from './application/internal/commandservices/reminder-command.service';
export * from './application/internal/queryservices/reminder-query.service';

// Presentation - Resources
export * from './presentation/resources/reminder.resource';

// Presentation - Routes
export * from './presentation/reminders.routes';
