/**
 * Transactions Bounded Context - Public API
 * Barrel export para el bounded context Transactions
 */

// Domain - Aggregates
export * from './domain/model/aggregates/account';
export * from './domain/model/aggregates/category';
export * from './domain/model/aggregates/transaction';

// Domain - Value Objects
export * from './domain/model/valueobjects/transaction-type';
export * from './domain/model/valueobjects/category-type';

// Domain - Commands
export * from './domain/model/commands/create-account.command';
export * from './domain/model/commands/create-category.command';
export * from './domain/model/commands/create-transaction.command';
export * from './domain/model/commands/update-transaction.command';
export * from './domain/model/commands/delete-transaction.command';

// Domain - Queries
export * from './domain/model/queries/get-all-accounts.query';
export * from './domain/model/queries/get-all-categories.query';
export * from './domain/model/queries/get-all-transactions.query';

// Application - Services
export * from './application/internal/commandservices/transaction-command.service';
export * from './application/internal/queryservices/transaction-query.service';

// Presentation - Resources
export * from './presentation/resources/account.resource';
export * from './presentation/resources/category.resource';
export * from './presentation/resources/transaction.resource';

// Presentation - Routes
export * from './presentation/transactions.routes';
