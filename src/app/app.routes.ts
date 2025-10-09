import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/login/login.routes').then(m => m.loginRoutes),
  },
  {
    path: 'register',
    loadChildren: () =>
      import('./features/auth/register/register.routes').then(m => m.registerRoutes),
  },
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.routes').then(m => m.homeRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'incomes',
    loadChildren: () =>
      import('./features/incomes/incomes.routes').then(m => m.incomesRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'expenses',
    loadChildren: () =>
      import('./features/expenses/expenses.routes').then(m => m.expensesRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'goals',
    loadChildren: () =>
      import('./features/goals/goals.routes').then(m => m.goalsRoutes),
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./features/profile/profile.routes').then(m => m.profileRoutes),
    canActivate: [authGuard],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
