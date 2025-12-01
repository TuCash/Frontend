/**
 * Reminders Bounded Context - Presentation Layer
 * Rutas del módulo Reminders
 */

import { Routes } from '@angular/router';

export const REMINDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reminders-list/reminders-list.component').then(
        (m) => m.RemindersListComponent
      ),
  },
];
