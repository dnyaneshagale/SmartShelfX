import { Routes } from '@angular/router';

export const TRANSACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./transaction-list/transaction-list.component').then(m => m.TransactionListComponent)
  }
];
