/**
 * Transactions Bounded Context - Presentation Layer
 * Rutas del módulo Transactions
 */

import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/transactions-list/transactions-list.component').then(
        (m) => m.TransactionsListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/transaction-form/transaction-form.component').then(
        (m) => m.TransactionFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/transaction-detail/transaction-detail.component').then(
        (m) => m.TransactionDetailComponent
      ),
  },
];
