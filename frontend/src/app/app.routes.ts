import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { warehouseGuard } from './guards/warehouse.guard';
import { vendorGuard } from './guards/vendor.guard';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';

// Role-specific dashboard imports
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { WarehouseDashboardComponent } from './features/warehouse/warehouse-dashboard/warehouse-dashboard.component';
import { VendorDashboardComponent } from './features/vendor/vendor-dashboard/vendor-dashboard.component';

// Admin feature components
import { UserManagementComponent } from './features/admin/user-management/user-management.component';
import { VendorAssignmentComponent } from './features/admin/vendor-assignment/vendor-assignment.component';
import { ReportsComponent } from './features/admin/reports/reports.component';
import { ApprovalRequestsComponent } from './components/approval-requests/approval-requests.component';

// Warehouse feature components
import { InventoryListComponent } from './features/warehouse/inventory-list/inventory-list.component';
import { ReorderRequestsComponent } from './features/warehouse/reorder-requests/reorder-requests.component';

// Vendor feature components
import { MyProductsComponent } from './features/vendor/my-products/my-products.component';
import { MyOrdersComponent } from './features/vendor/my-orders/my-orders.component';
import { VendorApprovalRequestsComponent } from './components/vendor/vendor-approval-requests.component';

// Shared component imports (will be reorganized later)
import { ProductListComponent } from './components/products/product-list.component';
import { StockTransactionComponent } from './components/stock/stock-transaction.component';
import { ForecastViewComponent } from './components/forecast/forecast-view.component';
import { PurchaseOrderListComponent } from './components/purchase-orders/purchase-order-list.component';

export const routes: Routes = [
  // Public routes
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },

  // Admin routes
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'products', component: ProductListComponent },
      { path: 'users', component: UserManagementComponent },
      { path: 'vendors', component: VendorAssignmentComponent },
      { path: 'purchase-orders', component: PurchaseOrderListComponent },
      { path: 'forecast', component: ForecastViewComponent },
      { path: 'reports', component: ReportsComponent },
      { path: 'approvals', component: ApprovalRequestsComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Warehouse Manager routes
  {
    path: 'warehouse',
    canActivate: [authGuard, warehouseGuard],
    children: [
      { path: 'dashboard', component: WarehouseDashboardComponent },
      { path: 'inventory', component: InventoryListComponent },
      { path: 'stock', component: StockTransactionComponent },
      { path: 'reorder', component: ReorderRequestsComponent },
      { path: 'purchase-orders', component: PurchaseOrderListComponent },
      { path: 'forecast', component: ForecastViewComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Vendor routes
  {
    path: 'vendor',
    canActivate: [authGuard, vendorGuard],
    children: [
      { path: 'dashboard', component: VendorDashboardComponent },
      { path: 'products', component: MyProductsComponent },
      { path: 'purchase-orders', component: MyOrdersComponent },
      { path: 'approval-requests', component: VendorApprovalRequestsComponent },
      { path: 'forecast', component: ForecastViewComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Legacy routes - redirect to role-specific dashboards
  { 
    path: 'dashboard', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  { 
    path: 'products', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  { 
    path: 'stock', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  { 
    path: 'forecast', 
    redirectTo: '', 
    pathMatch: 'full' 
  },
  { 
    path: 'purchase-orders', 
    redirectTo: '', 
    pathMatch: 'full' 
  },

  // Default route - will be handled by login component based on role
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
