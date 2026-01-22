import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { PurchaseOrder, Product } from '../../../models/models';

interface VendorDashboardStats {
  assignedProductsCount: number;
  pendingOrdersCount: number;
  approvedOrdersCount: number;
  rejectedOrdersCount: number;
  assignedProducts: Product[];
  pendingOrders: PurchaseOrder[];
  recentOrders: PurchaseOrder[];
}

@Component({
  selector: 'app-vendor-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatBadgeModule],
  template: `
    <div class="vendor-dashboard">
      <div class="dashboard-header">
        <h1>Vendor Portal</h1>
        <p class="subtitle">Manage assigned products and fulfill orders</p>
      </div>

      @if (stats) {
        <!-- Stats Overview -->
        <div class="stats-grid">
          <mat-card class="stat-card vendor-theme">
            <mat-card-content>
              <div class="stat-icon products">
                <mat-icon>inventory</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.assignedProductsCount}}</h2>
                <p>My Products</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card vendor-theme action-required" [class.pulse]="stats.pendingOrdersCount > 0">
            <mat-card-content>
              <div class="stat-icon pending">
                <mat-icon [matBadge]="stats.pendingOrdersCount" matBadgeColor="warn">
                  hourglass_empty
                </mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.pendingOrdersCount}}</h2>
                <p>Action Required</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card vendor-theme">
            <mat-card-content>
              <div class="stat-icon approved">
                <mat-icon>check_circle</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.approvedOrdersCount}}</h2>
                <p>Approved Orders</p>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card class="stat-card vendor-theme">
            <mat-card-content>
              <div class="stat-icon rejected">
                <mat-icon>cancel</mat-icon>
              </div>
              <div class="stat-info">
                <h2>{{stats.rejectedOrdersCount}}</h2>
                <p>Rejected Orders</p>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Main Content Grid -->
        <div class="content-grid">
          <!-- Pending Purchase Orders - ACTION REQUIRED -->
          <mat-card class="content-card highlight-card">
            <mat-card-header>
              <mat-card-title class="action-title">
                <mat-icon>notification_important</mat-icon>
                Pending Orders - Action Required
                @if (stats.pendingOrdersCount > 0) {
                  <mat-chip class="urgent-badge">{{stats.pendingOrdersCount}} NEW</mat-chip>
                }
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stats.pendingOrders && stats.pendingOrders.length > 0) {
                <div class="pending-orders-list">
                  @for (po of stats.pendingOrders; track po.id) {
                    <div class="pending-order-item">
                      <div class="po-header">
                        <div class="po-info">
                          <h3>{{po.product?.name}}</h3>
                          <p class="po-number">Order: {{po.poNumber}}</p>
                        </div>
                        <mat-chip class="status-pending">PENDING</mat-chip>
                      </div>
                      <div class="po-details">
                        <div class="detail">
                          <mat-icon>shopping_cart</mat-icon>
                          <span>Quantity: <strong>{{po.quantity}} units</strong></span>
                        </div>
                        <div class="detail">
                          <mat-icon>attach_money</mat-icon>
                          <span>Total: <strong>\${{po.totalCost}}</strong></span>
                        </div>
                        <div class="detail">
                          <mat-icon>calendar_today</mat-icon>
                          <span>Expected: <strong>{{po.expectedDeliveryDate | date}}</strong></span>
                        </div>
                      </div>
                      <div class="po-actions">
                        <button mat-raised-button color="primary" (click)="approveOrder(po.id)">
                          <mat-icon>check</mat-icon>
                          APPROVE
                        </button>
                        <button mat-raised-button color="warn" (click)="rejectOrder(po.id)">
                          <mat-icon>close</mat-icon>
                          REJECT
                        </button>
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="no-data">
                  <mat-icon>check_circle_outline</mat-icon>
                  <p>No pending orders</p>
                </div>
              }
            </mat-card-content>
          </mat-card>

          <!-- My Assigned Products -->
          <mat-card class="content-card">
            <mat-card-header>
              <mat-card-title>
                <mat-icon>inventory_2</mat-icon>
                My Assigned Products
              </mat-card-title>
            </mat-card-header>
            <mat-card-content>
              @if (stats.assignedProducts && stats.assignedProducts.length > 0) {
                <div class="products-list">
                  @for (product of stats.assignedProducts.slice(0, 5); track product.id) {
                    <div class="product-item">
                      <div class="product-icon">
                        <mat-icon>category</mat-icon>
                      </div>
                      <div class="product-details">
                        <strong>{{product.name}}</strong>
                        <p>SKU: {{product.sku}}</p>
                        <small>Category: {{product.category}}</small>
                      </div>
                      <button mat-icon-button (click)="viewProduct(product.id)">
                        <mat-icon>arrow_forward</mat-icon>
                      </button>
                    </div>
                  }
                </div>
              } @else {
                <p class="no-data">No assigned products</p>
              }
              <button mat-stroked-button color="primary" class="view-all-btn" (click)="navigateTo('/vendor/products')">
                View All Products
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Recent Order History -->
        <mat-card class="full-width-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>history</mat-icon>
              Recent Order History
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            @if (stats.recentOrders && stats.recentOrders.length > 0) {
              <div class="orders-table">
                @for (po of stats.recentOrders.slice(0, 6); track po.id) {
                  <div class="order-row">
                    <span class="order-number">{{po.poNumber}}</span>
                    <span class="order-product">{{po.product?.name}}</span>
                    <span class="order-quantity">{{po.quantity}} units</span>
                    <span class="order-amount">\${{po.totalCost}}</span>
                    <mat-chip [class]="'status-' + po.status.toLowerCase()">
                      {{po.status}}
                    </mat-chip>
                    <span class="order-date">{{po.expectedDeliveryDate | date:'short'}}</span>
                  </div>
                }
              </div>
            } @else {
              <p class="no-data">No order history</p>
            }
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <button mat-raised-button color="primary" (click)="navigateTo('/vendor/products')">
              <mat-icon>inventory</mat-icon>
              My Products
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/vendor/approval-requests')">
              <mat-icon>approval</mat-icon>
              Stock Approvals
            </button>
            <button mat-raised-button color="accent" (click)="navigateTo('/vendor/purchase-orders')">
              <mat-icon>receipt</mat-icon>
              All Orders
            </button>
            <button mat-raised-button (click)="navigateTo('/vendor/forecast')">
              <mat-icon>analytics</mat-icon>
              Demand Forecast
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
    .vendor-dashboard {
      padding: 24px;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

    .stat-card.action-required.pulse {
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
      50% { box-shadow: 0 4px 20px rgba(255, 152, 0, 0.6); }
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

    .stat-icon.products { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .stat-icon.pending { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .stat-icon.approved { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
    .stat-icon.rejected { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }

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
      grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }

    .content-card {
      background: white;
      border-radius: 8px;
    }

    .highlight-card {
      border: 2px solid #ff9800;
      box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
    }

    .action-title {
      color: #ff9800;
      font-weight: 600;
    }

    .urgent-badge {
      background-color: #ff5722 !important;
      color: white !important;
      font-weight: 600;
      margin-left: auto;
    }

    .pending-orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .pending-order-item {
      border: 2px solid #ff9800;
      border-radius: 8px;
      padding: 20px;
      background: #fff8e1;
    }

    .po-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }

    .po-info h3 {
      margin: 0 0 4px 0;
      color: #333;
      font-size: 18px;
    }

    .po-number {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .po-details {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .detail {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
    }

    .detail mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #ff9800;
    }

    .detail strong {
      color: #333;
    }

    .po-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }

    .po-actions button {
      flex: 1;
      height: 48px;
      font-size: 15px;
      font-weight: 600;
    }

    .status-pending { background-color: #fff9c4 !important; color: #f57c00 !important; }
    .status-approved { background-color: #c8e6c9 !important; color: #2e7d32 !important; }
    .status-rejected { background-color: #ffcdd2 !important; color: #c62828 !important; }
    .status-completed { background-color: #bbdefb !important; color: #1565c0 !important; }

    .products-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 16px;
    }

    .product-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
    }

    .product-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f093fb;
    }

    .product-icon mat-icon {
      color: white;
    }

    .product-details {
      flex: 1;
    }

    .product-details strong {
      display: block;
      color: #333;
      margin-bottom: 2px;
    }

    .product-details p {
      margin: 2px 0;
      font-size: 13px;
      color: #666;
    }

    .product-details small {
      font-size: 12px;
      color: #999;
    }

    .view-all-btn {
      width: 100%;
      margin-top: 12px;
    }

    .full-width-card {
      background: white;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .orders-table {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .order-row {
      display: grid;
      grid-template-columns: 120px 1fr 100px 100px 120px 150px;
      gap: 12px;
      align-items: center;
      padding: 12px;
      background: #f9f9f9;
      border-radius: 6px;
    }

    .order-number {
      font-weight: 600;
      color: #f093fb;
    }

    .order-product {
      color: #333;
    }

    .order-quantity,
    .order-amount {
      color: #666;
      font-size: 14px;
    }

    .order-date {
      color: #999;
      font-size: 13px;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 32px;
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #ddd;
      margin-bottom: 8px;
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

      .order-row {
        grid-template-columns: 1fr;
        gap: 8px;
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VendorDashboardComponent implements OnInit {
  stats: VendorDashboardStats | null = null;
  userId: number;

  constructor(
    private poService: PurchaseOrderService,
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {
    const currentUser = this.authService.getCurrentUser();
    this.userId = currentUser?.id || 0;
    console.log('VendorDashboard - User ID:', this.userId, 'Full User:', currentUser);
  }

  ngOnInit(): void {
    if (this.userId) {
      this.loadDashboardStats();
    } else {
      console.error('VendorDashboard - No user ID found');
    }
  }

  loadDashboardStats(): void {
    console.log('VendorDashboard - Loading stats for vendor ID:', this.userId);
    // Load vendor's purchase orders
    this.poService.getPurchaseOrdersByVendor(this.userId).subscribe({
      next: (orders) => {
        console.log('VendorDashboard - Received orders:', orders);
        const pending = orders.filter(po => po.status === 'PENDING');
        const approved = orders.filter(po => po.status === 'APPROVED');
        const rejected = orders.filter(po => po.status === 'REJECTED');

        this.stats = {
          assignedProductsCount: 0,
          pendingOrdersCount: pending.length,
          approvedOrdersCount: approved.length,
          rejectedOrdersCount: rejected.length,
          assignedProducts: [],
          pendingOrders: pending,
          recentOrders: orders.slice(0, 6)
        };

        // Load assigned products
        this.loadAssignedProducts();
      },
      error: (error) => {
        console.error('VendorDashboard - Error loading orders:', error);
      }
    });
  }

  loadAssignedProducts(): void {
    console.log('VendorDashboard - Loading products...');
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('VendorDashboard - All products:', products);
        // Filter products assigned to this vendor
        const assigned = products.filter(p => {
          const vendorMatch = p.vendor?.id === this.userId;
          console.log(`Product ${p.name} - Vendor ID: ${p.vendor?.id}, Match: ${vendorMatch}`);
          return vendorMatch;
        });
        console.log('VendorDashboard - Assigned products:', assigned);
        if (this.stats) {
          this.stats.assignedProducts = assigned;
          this.stats.assignedProductsCount = assigned.length;
        }
      },
      error: (error) => {
        console.error('VendorDashboard - Error loading products:', error);
      }
    });
  }

  approveOrder(orderId: number): void {
    this.poService.approvePurchaseOrder(orderId).subscribe({
      next: () => {
        this.loadDashboardStats();
      },
      error: (error) => console.error('Error approving order:', error)
    });
  }

  rejectOrder(orderId: number): void {
    this.poService.rejectPurchaseOrder(orderId).subscribe({
      next: () => {
        this.loadDashboardStats();
      },
      error: (error) => console.error('Error rejecting order:', error)
    });
  }

  viewProduct(productId: number): void {
    this.router.navigate(['/vendor/products', productId]);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
