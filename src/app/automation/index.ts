/**
 * Automation Bounded Context - Public API
 * Barrel export para el bounded context Automation
 */

// Domain - Aggregates
export * from './domain/model/aggregates/recurring-transaction';

// Domain - Value Objects
export * from './domain/model/valueobjects/recurring-frequency';

// Domain - Commands
export * from './domain/model/commands/create-recurring-transaction.command';
export * from './domain/model/commands/update-recurring-status.command';

// Domain - Queries
export * from './domain/model/queries/get-all-recurring-transactions.query';

// Application - Services
export * from './application/internal/commandservices/automation-command.service';
export * from './application/internal/queryservices/automation-query.service';

// Presentation - Resources
export * from './presentation/resources/recurring-transaction.resource';

// Presentation - Routes
export * from './presentation/automation.routes';
