/**
 * Savings Bounded Context - Presentation Layer
 * Rutas del módulo Savings
 */

import { Routes } from '@angular/router';

export const SAVINGS_ROUTES: Routes = [
  {
    path: 'goals',
    loadComponent: () =>
      import('./pages/goals/goals-list.component').then((m) => m.GoalsListComponent),
  },
  {
    path: 'budgets',
    loadComponent: () =>
      import('./pages/budgets/budgets-list.component').then((m) => m.BudgetsListComponent),
  },
  {
    path: '',
    redirectTo: 'goals',
    pathMatch: 'full',
  },
];
