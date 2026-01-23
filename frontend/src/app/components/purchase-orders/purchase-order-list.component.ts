import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrder } from '../../models/models';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatSnackBarModule],
  template: `
    <div class="po-container">
      <h1>
        @if (isVendor) {
          My Purchase Orders
        } @else {
          Purchase Orders
        }
      </h1>

      <div class="table-container mat-elevation-z8">
        <table class="simple-table">
          <thead>
            <tr>
              <th>PO Number</th>
              @if (!isVendor) {
                <th>Vendor</th>
              }
              <th>Product</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Status</th>
              <th>Expected Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @if (purchaseOrders.length === 0) {
              <tr>
                <td [attr.colspan]="isVendor ? 7 : 8" class="no-data">
                  No purchase orders found
                </td>
              </tr>
            }
            @for (po of purchaseOrders; track po.id) {
              <tr>
                <td>{{po.poNumber}}</td>
                @if (!isVendor) {
                  <td>{{po.vendor?.fullName || po.vendor?.username}}</td>
                }
                <td>{{po.product?.name}}</td>
                <td>{{po.quantity}}</td>
                <td>\${{po.totalCost}}</td>
                <td>
                  <mat-chip [class]="'status-' + po.status.toLowerCase()">
                    {{po.status}}
                  </mat-chip>
                </td>
                <td>{{po.expectedDeliveryDate | date}}</td>
                <td>
                  @if (po.status === 'PENDING' && (isVendor || isAdmin || isManager)) {
                    <button mat-raised-button color="primary" (click)="approve(po.id)">
                      Approve
                    </button>
                    <button mat-raised-button color="warn" (click)="reject(po.id)">
                      Reject
                    </button>
                  }
                  @if (po.status !== 'PENDING') {
                    <span class="status-text">{{po.status}}</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .po-container {
      padding: 20px;
    }

    .table-container {
      overflow-x: auto;
      background: white;
      border-radius: 4px;
    }

    .simple-table {
      width: 100%;
      border-collapse: collapse;
    }

    .simple-table th {
      background-color: #f5f5f5;
      padding: 16px;
      text-align: left;
      font-weight: 500;
      border-bottom: 2px solid #e0e0e0;
    }

    .simple-table td {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .simple-table tbody tr:hover {
      background-color: #f5f5f5;
    }

    .no-data {
      text-align: center;
      color: #757575;
      padding: 32px !important;
    }

    .status-pending {
      background-color: #fff9c4 !important;
    }

    .status-approved {
      background-color: #c8e6c9 !important;
    }

    .status-rejected {
      background-color: #ffcdd2 !important;
    }

    .status-completed {
      background-color: #bbdefb !important;
    }

    button {
      margin-right: 8px;
    }
  `]
})
export class PurchaseOrderListComponent implements OnInit {
  purchaseOrders: PurchaseOrder[] = [];
  userRole: string;
  isVendor: boolean;
  isAdmin: boolean;
  isManager: boolean;
  userId: number;

  constructor(
    private poService: PurchaseOrderService,
    private snackBar: MatSnackBar
  ) {
    this.userRole = localStorage.getItem('role') || 'USER';
    this.userId = parseInt(localStorage.getItem('userId') || '0');
    this.isVendor = this.userRole === 'VENDOR';
    this.isAdmin = this.userRole === 'ADMIN';
    this.isManager = this.userRole === 'MANAGER';
  }

  ngOnInit(): void {
    this.loadPurchaseOrders();
  }

  loadPurchaseOrders(): void {
    if (this.isVendor) {
      // Vendors only see their own purchase orders
      this.poService.getPurchaseOrdersByVendor(this.userId).subscribe({
        next: (pos) => this.purchaseOrders = pos,
        error: (error) => console.error('Error loading purchase orders:', error)
      });
    } else {
      // Managers and admins see all purchase orders
      this.poService.getAllPurchaseOrders().subscribe({
        next: (pos) => this.purchaseOrders = pos,
        error: (error) => console.error('Error loading purchase orders:', error)
      });
    }
  }

  approve(id: number): void {
    this.poService.approvePurchaseOrder(id).subscribe({
      next: () => {
        this.snackBar.open('Purchase order approved', 'Close', { duration: 3000 });
        this.loadPurchaseOrders();
      },
      error: (error) => {
        this.snackBar.open('Error approving purchase order', 'Close', { duration: 3000 });
        console.error('Error:', error);
      }
    });
  }

  reject(id: number): void {
    this.poService.rejectPurchaseOrder(id).subscribe({
      next: () => {
        this.snackBar.open('Purchase order rejected', 'Close', { duration: 3000 });
        this.loadPurchaseOrders();
      },
      error: (error) => {
        this.snackBar.open('Error rejecting purchase order', 'Close', { duration: 3000 });
        console.error('Error:', error);
      }
    });
  }
}
