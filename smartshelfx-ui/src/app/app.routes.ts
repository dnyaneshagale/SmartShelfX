import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      },
      {
        path: 'inventory',
        loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      },
      {
        path: 'transactions',
        loadChildren: () => import('./features/transactions/transactions.routes').then(m => m.TRANSACTIONS_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER'] }
      },
      {
        path: 'forecasting',
        loadChildren: () => import('./features/forecasting/forecasting.routes').then(m => m.FORECASTING_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      },
      {
        path: 'purchase-orders',
        loadChildren: () => import('./features/purchase-orders/purchase-orders.routes').then(m => m.PURCHASE_ORDERS_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      },
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes').then(m => m.NOTIFICATIONS_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      },
      {
        path: 'analytics',
        loadChildren: () => import('./features/analytics/analytics.routes').then(m => m.ANALYTICS_ROUTES),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER'] }
      },
      {
        path: 'admin',
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
        data: { roles: ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'] }
      }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
