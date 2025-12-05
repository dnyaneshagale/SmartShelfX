import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { NgxChartsModule, Color, ScaleType, LegendPosition } from '@swimlane/ngx-charts';
import { ProductService } from '../../../core/services/product.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { AuthService } from '../../../core/services/auth.service';
import { DashboardResponse, Product, Notification, ReorderRequest, Role } from '../../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MatTableModule, MatChipsModule, NgxChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  dashboardData: DashboardResponse | null = null;
  lowStockProducts: Product[] = [];
  recentNotifications: Notification[] = [];
  pendingReorders: ReorderRequest[] = [];
  inventoryByCategory: any[] = [];
  stockTrendData: any[] = [];
  colorScheme: Color = { name: 'vivid', selectable: true, group: ScaleType.Ordinal, domain: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] };
  legendPosition: LegendPosition = LegendPosition.Below;
  userRole: Role | null = null;

  constructor(
    private productService: ProductService,
    private analyticsService: AnalyticsService,
    private notificationService: NotificationService,
    private purchaseOrderService: PurchaseOrderService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.userRole = this.authService.getCurrentUser()?.role || null;
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.productService.getDashboard().subscribe({
      next: (data: DashboardResponse) => { this.dashboardData = data; this.prepareChartData(); this.isLoading = false; },
      error: () => this.isLoading = false
    });

    this.productService.getLowStockProducts().subscribe({
      next: (products: Product[]) => this.lowStockProducts = products.slice(0, 5)
    });

    this.notificationService.getAllNotifications().subscribe({
      next: (notifications: Notification[]) => this.recentNotifications = notifications.slice(0, 5)
    });

    this.purchaseOrderService.getPendingReorderRequests().subscribe({
      next: (page) => this.pendingReorders = page.content.slice(0, 5)
    });
  }

  prepareChartData(): void {
    if (this.dashboardData) {
      this.inventoryByCategory = [
        { name: 'Electronics', value: 35 },
        { name: 'Clothing', value: 25 },
        { name: 'Food', value: 20 },
        { name: 'Home', value: 15 },
        { name: 'Other', value: 5 }
      ];
      this.stockTrendData = [{
        name: 'Stock Level',
        series: [
          { name: 'Mon', value: 850 }, { name: 'Tue', value: 920 }, { name: 'Wed', value: 880 },
          { name: 'Thu', value: 950 }, { name: 'Fri', value: 1020 }, { name: 'Sat', value: 980 }, { name: 'Sun', value: 1050 }
        ]
      }];
    }
  }

  getStockStatusColor(status: string): string {
    switch (status) {
      case 'IN_STOCK': return 'primary';
      case 'LOW_STOCK': return 'warn';
      case 'OUT_OF_STOCK': return 'accent';
      default: return 'primary';
    }
  }

  isAdmin(): boolean {
    return this.userRole === 'ADMIN';
  }

  isWarehouseManager(): boolean {
    return this.userRole === 'WAREHOUSEMANAGER';
  }

  isVendor(): boolean {
    return this.userRole === 'VENDOR';
  }
}
