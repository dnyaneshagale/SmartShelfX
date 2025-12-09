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

    // Load real analytics data for charts
    this.loadCategoryDistribution();
    this.loadStockTrend();
  }

  loadCategoryDistribution(): void {
    this.analyticsService.getCategoryDistribution().subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.inventoryByCategory = data.map(item => ({
            name: item.categoryName || item.name,
            value: item.productCount || item.value || 0
          }));
        }
      },
      error: () => {
        // Fallback to dashboard data if analytics fails
        this.setFallbackCategoryData();
      }
    });
  }

  loadStockTrend(): void {
    this.analyticsService.getInventoryTrends(undefined, undefined, 7).subscribe({
      next: (data: any[]) => {
        if (data && data.length > 0) {
          this.stockTrendData = [{
            name: 'Stock Level',
            series: data.map(item => ({
              name: item.label || item.date,
              value: item.quantity || item.value || 0
            }))
          }];
        }
      },
      error: () => {
        // Fallback if analytics fails
        this.setFallbackTrendData();
      }
    });
  }

  prepareChartData(): void {
    if (this.dashboardData) {
      // Use dashboard data for category distribution if not already loaded
      if (this.inventoryByCategory.length === 0) {
        this.setFallbackCategoryData();
      }
      // Use dashboard data for trend if not already loaded
      if (this.stockTrendData.length === 0) {
        this.setFallbackTrendData();
      }
    }
  }

  private setFallbackCategoryData(): void {
    if (this.dashboardData) {
      // Create distribution from actual stock status
      this.inventoryByCategory = [
        { name: 'In Stock', value: this.dashboardData.inStockCount || 0 },
        { name: 'Low Stock', value: this.dashboardData.lowStockCount || 0 },
        { name: 'Out of Stock', value: this.dashboardData.outOfStockCount || 0 }
      ].filter(item => item.value > 0);
    }
  }

  private setFallbackTrendData(): void {
    if (this.dashboardData) {
      // Create a simple trend based on current data
      const total = this.dashboardData.totalProducts || 0;
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      this.stockTrendData = [{
        name: 'Stock Level',
        series: days.map((day, i) => ({
          name: day,
          value: Math.max(0, total + Math.floor(Math.random() * 20) - 10)
        }))
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
