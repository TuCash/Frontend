/**
 * TuCash Application - Main Routes
 * Rutas principales que cargan los bounded contexts
 */

import { Routes } from '@angular/router';
import { authGuard } from './shared/infrastructure/guards/auth.guard';

export const routes: Routes = [
  // IAM Bounded Context (Login, Register)
  {
    path: 'auth',
    loadChildren: () => import('./iam/presentation/iam.routes').then((m) => m.IAM_ROUTES),
  },

  // IAM Profile (Protected)
  {
    path: 'iam',
    loadChildren: () => import('./iam/presentation/iam.routes').then((m) => m.IAM_ROUTES),
    canActivate: [authGuard],
  },

  // Dashboard Bounded Context
  {
    path: 'home',
    loadChildren: () =>
      import('./dashboard/presentation/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
    canActivate: [authGuard],
  },

  // Transactions Bounded Context
  {
    path: 'transactions',
    loadChildren: () =>
      import('./transactions/presentation/transactions.routes').then(
        (m) => m.TRANSACTIONS_ROUTES
      ),
    canActivate: [authGuard],
  },

  // Savings Bounded Context
  {
    path: 'savings',
    loadChildren: () =>
      import('./savings/presentation/savings.routes').then((m) => m.SAVINGS_ROUTES),
    canActivate: [authGuard],
  },

  // Automation Bounded Context
  {
    path: 'automation',
    loadChildren: () =>
      import('./automation/presentation/automation.routes').then((m) => m.AUTOMATION_ROUTES),
    canActivate: [authGuard],
  },

  // Notifications Bounded Context
  {
    path: 'notifications',
    loadChildren: () =>
      import('./notifications/presentation/notifications.routes').then(
        (m) => m.NOTIFICATIONS_ROUTES
      ),
    canActivate: [authGuard],
  },

  // Reminders Bounded Context
  {
    path: 'reminders',
    loadChildren: () =>
      import('./reminders/presentation/reminders.routes').then((m) => m.REMINDERS_ROUTES),
    canActivate: [authGuard],
  },

  // Legacy routes redirects (temporal para compatibilidad)
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'incomes', redirectTo: '/transactions', pathMatch: 'full' },
  { path: 'expenses', redirectTo: '/transactions', pathMatch: 'full' },
  { path: 'goals', redirectTo: '/savings/goals', pathMatch: 'full' },
  { path: 'profile', redirectTo: '/iam/profile', pathMatch: 'full' },

  // Default route
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' },
];
