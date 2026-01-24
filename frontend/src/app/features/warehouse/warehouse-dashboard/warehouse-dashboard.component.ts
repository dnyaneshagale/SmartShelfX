import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { StockService } from '../../../services/stock.service';
import { DashboardStats, StockTransaction, Product } from '../../../models/models';

interface WarehouseDashboardStats {
  inventoryCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  reorderPending: number;
  recentTransactions: StockTransaction[];
  reorderProducts: Product[];
}

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  template: `
    <div class="warehouse-dashboard">
      <div class="dashboard-header">
        <h1>Warehouse Manager Portal</h1>
        <p class="subtitle">Operational inventory management</p>
      </div>

      @if (stats) {
        <!-- Inventory Status Grid -->
        <div class="stats-grid">
          <mat-card class="stat-card warehouse-theme">
            <mat-card-content>
              <div class="stat-icon inventory">
                <mat-icon>inventory</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.inventoryCount}}</h2>
                <p>Total Products</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warehouse-theme" [class.alert]="stats.lowStockCount > 0">
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

          <mat-card class="stat-card warehouse-theme" [class.critical]="stats.outOfStockCount > 0">
            <mat-card-content>
              <div class="stat-icon out-of-stock">
                <mat-icon>report_problem</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.outOfStockCount}}</h2>
                <p>Out of Stock</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card warehouse-theme">
            <mat-card-content>
              <div class="stat-icon reorder">
                <mat-icon>autorenew</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.reorderPending}}</h2>
                <p>Reorder Pending</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Content Grid -->
        <div class="content-grid">
          <!-- Recent Stock Transactions -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>history</mat-icon>
                Recent Stock Transactions
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stats.recentTransactions && stats.recentTransactions.length > 0) {
                <div class="transaction-list">
                  @for (transaction of stats.recentTransactions.slice(0, 8); track transaction.id) {
                    <div class="transaction-item" [class]="transaction.transactionType.toLowerCase()">
                      <div class="transaction-icon">
                        <mat-icon>
                          @if (transaction.transactionType === 'IN') {
                            arrow_downward
                          } @else {
                            arrow_upward
                          }
                        </mat-icon>
                      </div>
                      <div class="transaction-details">
                        <strong>{{transaction.product?.name}}</strong>
                        <p>
                          <mat-chip [class]="'type-' + transaction.transactionType.toLowerCase()">
                            {{transaction.transactionType}}
                          </mat-chip>
                          <span class="quantity">{{transaction.quantity}} units</span>
                        </p>
                        <small>{{transaction.transactionDate | date:'short'}}</small>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-data">No recent transactions</p>
              }
            </mat-card-content>
          </mat-card>

          <!-- Reorder Triggered Products -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>notification_important</mat-icon>
                Reorder Triggered Products
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stats.reorderProducts && stats.reorderProducts.length > 0) {
                <div class="reorder-list">
                  @for (product of stats.reorderProducts.slice(0, 6); track product.id) {
                    <div class="reorder-item">
                      <div class="reorder-icon">
                        <mat-icon>shopping_cart</mat-icon>
                      </div>
                      <div class="reorder-details">
                        <strong>{{product.name}}</strong>
                        <p class="stock-info">
                          <span class="current">Current: {{product.currentStock}}</span>
                          <span class="reorder">Reorder: {{product.reorderLevel}}</span>
                        </p>
                        @if (product.vendor) {
                          <small>Vendor: {{product.vendor.fullName || product.vendor.username}}</small>
                        }
                      </div>
                      <button mat-mini-fab color="accent" (click)="viewProduct(product.id)">
                        <mat-icon>visibility</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-data">No reorder alerts</p>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" (click)="navigateTo('/warehouse/stock')">
              <mat-icon>add_circle</mat-icon>
              Stock IN
            </button>
            <button mat-raised-button color="warn" (click)="navigateTo('/warehouse/stock')">
              <mat-icon>remove_circle</mat-icon>
              Stock OUT
            </button>
            <button mat-raised-button (click)="navigateTo('/warehouse/inventory')">
              <mat-icon>inventory</mat-icon>
              View Inventory
            </button>
            <button mat-raised-button (click)="navigateTo('/warehouse/purchase-orders')">
              <mat-icon>receipt</mat-icon>
              Purchase Orders
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/warehouse/forecast')">
              <mat-icon>analytics</mat-icon>
              View Forecast
            </button>
            <button mat-raised-button (click)="navigateTo('/warehouse/reorder')">
              <mat-icon>notification_important</mat-icon>
              Reorder Requests
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
    .warehouse-dashboard {
      padding: 24px;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
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
      border-left: 4px solid #ff9800;
    }

    .stat-card.critical {
      border-left: 4px solid #f44336;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      50% { box-shadow: 0 4px 20px rgba(244, 67, 54, 0.4); }
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

    .stat-icon.inventory { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .stat-icon.low-stock { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-icon.out-of-stock { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .stat-icon.reorder { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }

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

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }

    mat-card-title mat-icon {
      color: #11998e;
    }

    .transaction-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-height: 400px;
      overflow-y: auto;
    }

    .transaction-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 6px;
      background: #f9f9f9;
      border-left: 4px solid #11998e;
    }

    .transaction-item.in {
      border-left-color: #4caf50;
    }

    .transaction-item.out {
      border-left-color: #f44336;
    }

    .transaction-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0f2f1;
    }

    .transaction-item.in .transaction-icon {
      background: #e8f5e9;
    }

    .transaction-item.in .transaction-icon mat-icon {
      color: #4caf50;
    }

    .transaction-item.out .transaction-icon {
      background: #ffebee;
    }

    .transaction-item.out .transaction-icon mat-icon {
      color: #f44336;
    }

    .transaction-details {
      flex: 1;
    }

    .transaction-details strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }

    .transaction-details p {
      margin: 4px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .transaction-details small {
      color: #999;
      font-size: 12px;
    }

    .type-in { background-color: #c8e6c9 !important; color: #2e7d32 !important; }
    .type-out { background-color: #ffcdd2 !important; color: #c62828 !important; }

    .quantity {
      font-size: 14px;
      color: #666;
    }

    .reorder-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .reorder-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: #fff3e0;
      border-radius: 6px;
      border-left: 4px solid #ff9800;
    }

    .reorder-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffe0b2;
    }

    .reorder-icon mat-icon {
      color: #ff9800;
    }

    .reorder-details {
      flex: 1;
    }

    .reorder-details strong {
      display: block;
      color: #333;
      margin-bottom: 4px;
    }

    .stock-info {
      display: flex;
      gap: 16px;
      margin: 4px 0;
      font-size: 14px;
    }

    .stock-info .current {
      color: #f44336;
      font-weight: 500;
    }

    .stock-info .reorder {
      color: #ff9800;
      font-weight: 500;
    }

    .reorder-details small {
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

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class WarehouseDashboardComponent implements OnInit {
  stats: WarehouseDashboardStats | null = null;

  constructor(
    private dashboardService: DashboardService,
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    this.dashboardService.getStats().subscribe({
      next: (data: DashboardStats) => {
        this.stats = {
          inventoryCount: data.totalProducts,
          lowStockCount: data.lowStockCount,
          outOfStockCount: data.outOfStockCount || 0,
          reorderPending: data.pendingPurchaseOrders,
          recentTransactions: [],
          reorderProducts: data.reorderProducts || []
        };
        
        // Load recent transactions
        this.loadRecentTransactions();
      },
      error: (error) => console.error('Error loading dashboard stats:', error)
    });
  }

  loadRecentTransactions(): void {
    this.stockService.getRecentTransactions().subscribe({
      next: (transactions) => {
        if (this.stats) {
          this.stats.recentTransactions = transactions;
        }
      },
      error: (error) => console.error('Error loading transactions:', error)
    });
  }

  viewProduct(productId: number): void {
    // Navigate to reorder requests page where warehouse manager can take action
    this.router.navigate(['/warehouse/reorder']);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
