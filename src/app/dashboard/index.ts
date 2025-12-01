/**
 * Dashboard Bounded Context - Public API
 * Barrel export para el bounded context Dashboard
 */

// Domain - Value Objects
export * from './domain/model/valueobjects/dashboard-pulse';
export * from './domain/model/valueobjects/trend-series';
export * from './domain/model/valueobjects/category-leaks';

// Domain - Queries
export * from './domain/model/queries/get-pulse.query';
export * from './domain/model/queries/get-trends.query';
export * from './domain/model/queries/get-leaks.query';

// Application - Services
export * from './application/internal/queryservices/dashboard-query.service';

// Presentation - Resources
export * from './presentation/resources/dashboard.resource';

// Presentation - Routes
export * from './presentation/dashboard.routes';
