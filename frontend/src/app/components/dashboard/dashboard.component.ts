import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>
      
      @if (stats) {
        <div class="stats-grid">
          <mat-card class="stat-card">
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

          <mat-card class="stat-card" [class.alert]="stats.lowStockCount > 0">
            <mat-card-content>
              <div class="stat-icon low-stock">
                <mat-icon>warning</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.lowStockCount}}</h2>
                <p>Low Stock Items</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
            <mat-card-content>
              <div class="stat-icon orders">
                <mat-icon>shopping_cart</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.pendingPurchaseOrders}}</h2>
                <p>Pending Orders</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card">
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
        </div>
      }

      <div class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          @if (isWarehouseManager || isAdmin) {
            <button mat-raised-button color="primary" (click)="navigateTo('/products')">
              <mat-icon>inventory</mat-icon>
              View Products
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/stock')">
              <mat-icon>swap_horiz</mat-icon>
              Stock Transaction
            </button>
            <button mat-raised-button (click)="navigateTo('/forecast')">
              <mat-icon>analytics</mat-icon>
              View Forecast
            </button>
          }
          
          <button mat-raised-button (click)="navigateTo('/purchase-orders')">
            <mat-icon>receipt</mat-icon>
            @if (isVendor) {
              My Orders
            } @else {
              Purchase Orders
            }
          </button>
          
          @if (isVendor) {
            <button mat-raised-button color="primary" (click)="navigateTo('/products')">
              <mat-icon>inventory</mat-icon>
              My Products
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
    }

    h1 {
      margin-bottom: 30px;
      color: #333;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }

    .stat-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-5px);
    }

    .stat-card.alert {
      border-left: 4px solid #f44336;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .stat-icon {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.products {
      background-color: #e3f2fd;
      color: #2196f3;
    }

    .stat-icon.low-stock {
      background-color: #ffebee;
      color: #f44336;
    }

    .stat-icon.orders {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .stat-icon.vendors {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .stat-icon mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .stat-info h2 {
      margin: 0;
      font-size: 36px;
      font-weight: bold;
    }

    .stat-info p {
      margin: 5px 0 0 0;
      color: #666;
    }

    .quick-actions h2 {
      margin-bottom: 20px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .actions-grid button {
      height: 60px;
      font-size: 16px;
    }

    .actions-grid button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  userRole: string;
  isWarehouseManager: boolean;
  isVendor: boolean;
  isAdmin: boolean;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {
    this.userRole = localStorage.getItem('role') || 'USER';
    this.isWarehouseManager = this.userRole === 'WAREHOUSE_MANAGER';
    this.isVendor = this.userRole === 'VENDOR';
    this.isAdmin = this.userRole === 'ADMIN';
  }

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (stats) => this.stats = stats,
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
