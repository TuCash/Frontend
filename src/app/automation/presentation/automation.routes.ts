/**
 * Automation Bounded Context - Presentation Layer
 * Rutas del módulo Automation
 */

import { Routes } from '@angular/router';

export const AUTOMATION_ROUTES: Routes = [
  {
    path: 'recurring',
    loadComponent: () =>
      import('./pages/recurring/recurring-list.component').then(
        (m) => m.RecurringListComponent
      ),
  },
  {
    path: '',
    redirectTo: 'recurring',
    pathMatch: 'full',
  },
];
