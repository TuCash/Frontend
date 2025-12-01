/**
 * Savings Bounded Context - Public API
 * Barrel export para el bounded context Savings
 */

// Domain - Aggregates
export * from './domain/model/aggregates/goal';
export * from './domain/model/aggregates/budget';

// Domain - Value Objects
export * from './domain/model/valueobjects/goal-status';
export * from './domain/model/valueobjects/budget-period';

// Domain - Commands
export * from './domain/model/commands/create-goal.command';
export * from './domain/model/commands/update-goal-progress.command';
export * from './domain/model/commands/celebrate-goal.command';
export * from './domain/model/commands/create-budget.command';

// Domain - Queries
export * from './domain/model/queries/get-all-goals.query';
export * from './domain/model/queries/get-all-budgets.query';

// Application - Services
export * from './application/internal/commandservices/savings-command.service';
export * from './application/internal/queryservices/savings-query.service';

// Presentation - Resources
export * from './presentation/resources/goal.resource';
export * from './presentation/resources/budget.resource';

// Presentation - Routes
export * from './presentation/savings.routes';
