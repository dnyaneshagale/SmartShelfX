import { Routes } from '@angular/router';

export const ANALYTICS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./analytics-view/analytics-view.component').then(m => m.AnalyticsViewComponent)
  }
];
