import { Routes } from '@angular/router';

export const FORECASTING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./forecast-view/forecast-view.component').then(m => m.ForecastViewComponent)
  }
];
