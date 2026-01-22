import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { PurchaseOrder } from '../../../models/models';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="my-orders">
      <div class="header">
        <h1>My Purchase Orders</h1>
        <button mat-raised-button color="primary" (click)="refreshOrders()">
          <mat-icon>refresh</mat-icon>
          Refresh
        </button>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card pending">
          <mat-card-content>
            <mat-icon>pending_actions</mat-icon>
            <div>
              <h3>{{getPendingOrders().length}}</h3>
              <p>Pending Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card approved">
          <mat-card-content>
            <mat-icon>check_circle</mat-icon>
            <div>
              <h3>{{getApprovedOrders().length}}</h3>
              <p>Approved Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card rejected">
          <mat-card-content>
            <mat-icon>cancel</mat-icon>
            <div>
              <h3>{{getRejectedOrders().length}}</h3>
              <p>Rejected Orders</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>shopping_cart</mat-icon>
            <div>
              <h3>{{orders.length}}</h3>
              <p>Total Orders</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-tab-group>
        <mat-tab label="Pending">
          <div class="tab-content">
            @if (getPendingOrders().length === 0) {
              <div class="empty-state">
                <mat-icon>inbox</mat-icon>
                <h3>No Pending Orders</h3>
                <p>You don't have any pending orders at the moment.</p>
              </div>
            } @else {
              <div class="orders-grid">
                @for (order of getPendingOrders(); track order.id) {
                  <mat-card class="order-card pending-card">
                    <mat-card-header>
                      <div class="order-header">
                        <div>
                          <h3>Order #{{order.id}}</h3>
                          <p class="date">{{order.date | date:'medium'}}</p>
                        </div>
                        <mat-chip class="status-pending">PENDING</mat-chip>
                      </div>
                    </mat-card-header>

                    <mat-card-content>
                      <div class="order-details">
                        <div class="detail-item">
                          <mat-icon>inventory_2</mat-icon>
                          <div>
                            <span class="label">Product</span>
                            <span class="value">{{order.productName}}</span>
                          </div>
                        </div>
                        <div class="detail-item">
                          <mat-icon>format_list_numbered</mat-icon>
                          <div>
                            <span class="label">Quantity</span>
                            <span class="value quantity">{{order.quantity}} units</span>
                          </div>
                        </div>
                      </div>
                    </mat-card-content>

                    <mat-card-actions>
                      <button mat-raised-button color="primary" (click)="approveOrder(order)">
                        <mat-icon>check</mat-icon>
                        Approve
                      </button>
                      <button mat-raised-button color="warn" (click)="rejectOrder(order)">
                        <mat-icon>close</mat-icon>
                        Reject
                      </button>
                    </mat-card-actions>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="Approved">
          <div class="tab-content">
            @if (getApprovedOrders().length === 0) {
              <div class="empty-state">
                <mat-icon>check_circle_outline</mat-icon>
                <h3>No Approved Orders</h3>
                <p>You haven't approved any orders yet.</p>
              </div>
            } @else {
              <div class="orders-list">
                @for (order of getApprovedOrders(); track order.id) {
                  <mat-card class="order-list-card approved-card">
                    <mat-card-content>
                      <div class="order-row">
                        <div class="order-info">
                          <div class="order-id">
                            <mat-icon>receipt</mat-icon>
                            <strong>Order #{{order.id}}</strong>
                          </div>
                          <div class="product-info">
                            <span class="product-name">{{order.productName}}</span>
                            <span class="quantity">Qty: {{order.quantity}} units</span>
                          </div>
                          <div class="date-info">
                            <mat-icon>event</mat-icon>
                            {{order.date | date:'short'}}
                          </div>
                        </div>
                        <div class="order-status">
                          <mat-chip class="status-approved">APPROVED</mat-chip>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="Rejected">
          <div class="tab-content">
            @if (getRejectedOrders().length === 0) {
              <div class="empty-state">
                <mat-icon>cancel_presentation</mat-icon>
                <h3>No Rejected Orders</h3>
                <p>You haven't rejected any orders.</p>
              </div>
            } @else {
              <div class="orders-list">
                @for (order of getRejectedOrders(); track order.id) {
                  <mat-card class="order-list-card rejected-card">
                    <mat-card-content>
                      <div class="order-row">
                        <div class="order-info">
                          <div class="order-id">
                            <mat-icon>receipt</mat-icon>
                            <strong>Order #{{order.id}}</strong>
                          </div>
                          <div class="product-info">
                            <span class="product-name">{{order.productName}}</span>
                            <span class="quantity">Qty: {{order.quantity}} units</span>
                          </div>
                          <div class="date-info">
                            <mat-icon>event</mat-icon>
                            {{order.date | date:'short'}}
                          </div>
                        </div>
                        <div class="order-status">
                          <mat-chip class="status-rejected">REJECTED</mat-chip>
                        </div>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="All Orders">
          <div class="tab-content">
            <div class="table-container">
              <table class="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  @if (orders.length === 0) {
                    <tr>
                      <td colspan="6" class="no-data">No orders found</td>
                    </tr>
                  }
                  @for (order of orders; track order.id) {
                    <tr>
                      <td><strong>#{{order.id}}</strong></td>
                      <td>{{order.productName}}</td>
                      <td>{{order.quantity}} units</td>
                      <td>{{order.date | date:'short'}}</td>
                      <td>
                        <mat-chip [class]="'status-' + order.status.toLowerCase()">
                          {{order.status}}
                        </mat-chip>
                      </td>
                      <td>
                        @if (order.status === 'PENDING') {
                          <div class="table-actions">
                            <button mat-icon-button color="primary" (click)="approveOrder(order)" title="Approve Order">
                              <mat-icon>check</mat-icon>
                            </button>
                            <button mat-icon-button color="warn" (click)="rejectOrder(order)" title="Reject Order">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        } @else if (order.status === 'APPROVED') {
                          <span class="status-text approved-text">
                            <mat-icon>check_circle</mat-icon> Completed
                          </span>
                        } @else if (order.status === 'REJECTED') {
                          <span class="status-text rejected-text">
                            <mat-icon>cancel</mat-icon> Declined
                          </span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .my-orders {
      padding: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .header h1 {
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .stat-card mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f5576c;
    }

    .stat-card.pending mat-icon {
      color: #ff9800;
    }

    .stat-card.approved mat-icon {
      color: #4caf50;
    }

    .stat-card.rejected mat-icon {
      color: #f44336;
    }

    .stat-card h3 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }

    .stat-card p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .tab-content {
      padding: 24px 0;
    }

    .empty-state {
      text-align: center;
      padding: 64px 24px;
    }

    .empty-state mat-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #ccc;
      margin-bottom: 16px;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      color: #666;
    }

    .empty-state p {
      margin: 0;
      color: #999;
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .order-card {
      border-left: 4px solid #ff9800;
    }

    .order-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .order-header h3 {
      margin: 0 0 4px 0;
      font-size: 20px;
      font-weight: 600;
    }

    .order-header .date {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .order-details {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px 0;
    }

    .detail-item {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .detail-item mat-icon {
      color: #f5576c;
    }

    .detail-item .label {
      display: block;
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .detail-item .value {
      display: block;
      font-size: 16px;
      font-weight: 600;
      margin-top: 4px;
    }

    .detail-item .value.quantity {
      color: #f5576c;
    }

    mat-card-actions {
      display: flex;
      gap: 12px;
      padding: 16px;
    }

    mat-card-actions button {
      flex: 1;
    }

    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .order-list-card {
      transition: transform 0.2s;
    }

    .order-list-card:hover {
      transform: translateX(4px);
    }

    .order-list-card.approved-card {
      border-left: 4px solid #4caf50;
    }

    .order-list-card.rejected-card {
      border-left: 4px solid #f44336;
    }

    .order-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .order-info {
      display: flex;
      gap: 24px;
      align-items: center;
      flex: 1;
    }

    .order-id {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 120px;
    }

    .order-id mat-icon {
      color: #f5576c;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .product-name {
      font-weight: 600;
    }

    .quantity {
      font-size: 14px;
      color: #666;
    }

    .date-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #666;
      min-width: 180px;
    }

    .date-info mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-pending {
      background-color: #fff3e0 !important;
      color: #f57c00 !important;
    }

    .status-approved {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .status-rejected {
      background-color: #ffcdd2 !important;
      color: #c62828 !important;
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      border-collapse: collapse;
    }

    .orders-table th {
      background: #f5f5f5;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }

    .orders-table td {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .orders-table tbody tr:hover {
      background: #f9f9f9;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 48px !important;
    }

    .table-actions {
      display: flex;
      gap: 8px;
    }

    .no-action {
      color: #999;
    }

    .status-text {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 500;
    }

    .status-text mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .approved-text {
      color: #2e7d32;
    }

    .approved-text mat-icon {
      color: #4caf50;
    }

    .rejected-text {
      color: #c62828;
    }

    .rejected-text mat-icon {
      color: #f44336;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .orders-grid {
        grid-template-columns: 1fr;
      }

      .order-info {
        flex-wrap: wrap;
      }

      .order-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class MyOrdersComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  vendorId: number = 0;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('MyOrders - Current User:', user);
    if (user?.id) {
      this.vendorId = user.id;
      console.log('MyOrders - Vendor ID:', this.vendorId);
      this.loadOrders();
    } else {
      console.error('MyOrders - No user ID found!', user);
    }
  }

  loadOrders(): void {
    console.log('MyOrders - Loading orders for vendor:', this.vendorId);
    this.purchaseOrderService.getPurchaseOrdersByVendor(this.vendorId).subscribe({
      next: (orders) => {
        console.log('MyOrders - Received orders:', orders);
        this.orders = orders.map(order => ({
          ...order,
          date: order.createdAt || order.date || new Date(),
          productName: order.product?.name || order.productName || 'Unknown Product'
        })).sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        console.error('Error details:', JSON.stringify(error));
      }
    });
  }

  getPendingOrders(): PurchaseOrder[] {
    return this.orders.filter(o => o.status === 'PENDING');
  }

  getApprovedOrders(): PurchaseOrder[] {
    return this.orders.filter(o => o.status === 'APPROVED');
  }

  getRejectedOrders(): PurchaseOrder[] {
    return this.orders.filter(o => o.status === 'REJECTED');
  }

  approveOrder(order: PurchaseOrder): void {
    this.purchaseOrderService.approvePurchaseOrder(order.id).subscribe({
      next: () => {
        this.snackBar.open('Order approved successfully', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error approving order:', error);
        this.snackBar.open('Failed to approve order', 'Close', { duration: 3000 });
      }
    });
  }

  rejectOrder(order: PurchaseOrder): void {
    this.purchaseOrderService.rejectPurchaseOrder(order.id).subscribe({
      next: () => {
        this.snackBar.open('Order rejected', 'Close', { duration: 3000 });
        this.loadOrders();
      },
      error: (error) => {
        console.error('Error rejecting order:', error);
        this.snackBar.open('Failed to reject order', 'Close', { duration: 3000 });
      }
    });
  }

  refreshOrders(): void {
    this.loadOrders();
    this.snackBar.open('Orders refreshed', 'Close', { duration: 2000 });
  }
}
