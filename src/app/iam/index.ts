/**
 * IAM Bounded Context - Public API
 * Barrel export para el bounded context IAM
 */

// Domain - Commands
export * from './domain/model/commands/sign-in.command';
export * from './domain/model/commands/sign-up.command';
export * from './domain/model/commands/update-user.command';
export * from './domain/model/commands/update-preferences.command';

// Domain - Queries
export * from './domain/model/queries/get-user-by-id.query';

// Domain - Aggregates
export * from './domain/model/aggregates/user';

// Domain - Value Objects
export * from './domain/model/valueobjects/user-preferences';

// Application - Services
export * from './application/internal/commandservices/iam-command.service';
export * from './application/internal/queryservices/iam-query.service';

// Presentation - Resources
export * from './presentation/resources/sign-in.resource';
export * from './presentation/resources/sign-up.resource';
export * from './presentation/resources/user.resource';

// Presentation - Routes
export * from './presentation/iam.routes';
