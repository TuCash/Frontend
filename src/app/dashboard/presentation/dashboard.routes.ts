/**
 * Dashboard Bounded Context - Presentation Layer
 * Rutas del módulo Dashboard
 */

import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home-page.component').then((m) => m.HomePageComponent),
  },
];
