import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardStats, Product, PurchaseOrder } from '../../../models/models';

interface AdminDashboardStats {
  totalProducts: number;
  totalVendors: number;
  totalUsers: number;
  lowStockCount: number;
  pendingPurchaseOrders: number;
  approvedPurchaseOrders: number;
  rejectedPurchaseOrders: number;
  lowStockProducts: Product[];
  recentPurchaseOrders: PurchaseOrder[];
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="admin-dashboard">
      <div class="dashboard-header">
        <h1>Admin Portal</h1>
        <p class="subtitle">System-wide oversight and control</p>
      </div>

      @if (stats) {
        <!-- System Overview Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card admin-theme">
            <mat-card-content>
              <div class="stat-icon products">
                <mat-icon>inventory_2</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.totalProducts}}</h2>
                <p>Total Products</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card admin-theme">
            <mat-card-content>
              <div class="stat-icon vendors">
                <mat-icon>store</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.totalVendors}}</h2>
                <p>Vendors</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card admin-theme">
            <mat-card-content>
              <div class="stat-icon users">
                <mat-icon>people</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.totalUsers}}</h2>
                <p>Total Users</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card admin-theme" [class.alert]="stats.lowStockCount > 0">
            <mat-card-content>
              <div class="stat-icon low-stock">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.lowStockCount}}</h2>
                <p>Low Stock Alerts</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Purchase Order Overview -->
        <div class="content-grid">
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>Purchase Order Overview</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="po-stats">
                <div class="po-stat pending">
                  <mat-icon>hourglass_empty</mat-icon>
                  <div>
                    <h3>{{stats.pendingPurchaseOrders}}</h3>
                    <p>Pending</p>
                  </div>
                </div>
                <div class="po-stat approved">
                  <mat-icon>check_circle</mat-icon>
                  <div>
                    <h3>{{stats.approvedPurchaseOrders}}</h3>
                    <p>Approved</p>
                  </div>
                </div>
                <div class="po-stat rejected">
                  <mat-icon>cancel</mat-icon>
                  <div>
                    <h3>{{stats.rejectedPurchaseOrders}}</h3>
                    <p>Rejected</p>
                  </div>
                </div>
              </div>

              @if (stats.recentPurchaseOrders && stats.recentPurchaseOrders.length > 0) {
                <div class="recent-pos">
                  <h4>Recent Purchase Orders</h4>
                  <div class="po-list">
                    @for (po of stats.recentPurchaseOrders.slice(0, 5); track po.id) {
                      <div class="po-item">
                        <span class="po-number">{{po.poNumber}}</span>
                        <span class="po-product">{{po.product?.name}}</span>
                        <mat-chip [class]="'status-' + po.status.toLowerCase()">
                          {{po.status}}
                        </mat-chip>
                      </div>
                    }
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- Low Stock Alerts -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>Low Stock Alerts</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stats.lowStockProducts && stats.lowStockProducts.length > 0) {
                <div class="low-stock-list">
                  @for (product of stats.lowStockProducts.slice(0, 5); track product.id) {
                    <div class="low-stock-item">
                      <mat-icon class="warning-icon">warning</mat-icon>
                      <div class="product-info">
                        <strong>{{product.name}}</strong>
                        <p>Stock: {{product.currentStock}} / Reorder: {{product.reorderLevel}}</p>
                        @if (product.vendor) {
                          <small>Vendor: {{product.vendor.fullName || product.vendor.username}}</small>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-data">No low stock alerts</p>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" (click)="navigateTo('/admin/users')">
              <mat-icon>person_add</mat-icon>
              Manage Users
            </button>
            <button mat-raised-button color="primary" (click)="navigateTo('/admin/products')">
              <mat-icon>add_circle</mat-icon>
              Add Product
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/admin/vendors')">
              <mat-icon>store</mat-icon>
              Manage Vendors
            </button>
            <button mat-raised-button (click)="navigateTo('/admin/purchase-orders')">
              <mat-icon>receipt</mat-icon>
              View All Orders
            </button>
            <button mat-raised-button (click)="navigateTo('/admin/forecast')">
              <mat-icon>analytics</mat-icon>
              Forecast & Analytics
            </button>
            <button mat-raised-button (click)="navigateTo('/admin/reports')">
              <mat-icon>assessment</mat-icon>
              Reports
            </button>
          </div>
        </div>
      } @else {
        <div class="loading">
          <p>Loading dashboard...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      color: white;
      margin-bottom: 30px;
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 500;
    }

    .subtitle {
      margin: 8px 0 0 0;
      opacity: 0.9;
      font-size: 16px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 20px rgba(0,0,0,0.15);
    }

    .stat-card.alert {
      border-left: 4px solid #f44336;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .stat-icon.products { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .stat-icon.vendors { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-icon.users { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
    .stat-icon.low-stock { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }

    .stat-info h2 {
      margin: 0;
      font-size: 36px;
      font-weight: 600;
      color: #333;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .content-card {
      background: white;
      border-radius: 8px;
    }

    .po-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .po-stat {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .po-stat mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .po-stat.pending mat-icon { color: #ff9800; }
    .po-stat.approved mat-icon { color: #4caf50; }
    .po-stat.rejected mat-icon { color: #f44336; }

    .po-stat h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }

    .po-stat p {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .recent-pos h4 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .po-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .po-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
    }

    .po-number {
      font-weight: 500;
      color: #667eea;
      min-width: 100px;
    }

    .po-product {
      flex: 1;
      color: #333;
    }

    .status-pending { background-color: #fff9c4 !important; }
    .status-approved { background-color: #c8e6c9 !important; }
    .status-rejected { background-color: #ffcdd2 !important; }
    .status-completed { background-color: #bbdefb !important; }

    .low-stock-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .low-stock-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 6px;
      border-left: 4px solid #ff9800;
    }

    .warning-icon {
      color: #ff9800;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .product-info strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }

    .product-info p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .product-info small {
      display: block;
      margin-top: 4px;
      font-size: 12px;
      color: #999;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 32px;
    }

    .quick-actions {
      background: white;
      padding: 24px;
      border-radius: 8px;
    }

    .quick-actions h2 {
      margin: 0 0 20px 0;
      font-size: 20px;
      color: #333;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .actions-grid button {
      height: 56px;
      font-size: 14px;
    }

    .actions-grid button mat-icon {
      margin-right: 8px;
    }

    .loading {
      text-align: center;
      color: white;
      padding: 60px;
      font-size: 18px;
    }

    @media (max-width: 768px) {
      .stats-grid,
      .content-grid {
        grid-template-columns: 1fr;
      }

      .po-stats {
        grid-template-columns: 1fr;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: AdminDashboardStats | null = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = {
          totalProducts: data.totalProducts,
          totalVendors: data.totalVendors,
          totalUsers: data.totalUsers,
          lowStockCount: data.lowStockCount,
          pendingPurchaseOrders: data.pendingPurchaseOrders,
          approvedPurchaseOrders: data.approvedPurchaseOrders || 0,
          rejectedPurchaseOrders: data.rejectedPurchaseOrders || 0,
          lowStockProducts: data.reorderProducts || [],
          recentPurchaseOrders: data.recentPurchaseOrders || []
        };
      },
      error: (error) => console.error('Error loading dashboard stats:', error)
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
