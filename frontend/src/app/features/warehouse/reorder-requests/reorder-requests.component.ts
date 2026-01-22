import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { PurchaseOrderService } from '../../../services/purchase-order.service';
import { Product } from '../../../models/models';

@Component({
  selector: 'app-reorder-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="reorder-requests">
      <div class="header">
        <h1>Reorder Requests</h1>
        <button mat-raised-button color="primary" (click)="createBulkOrders()">
          <mat-icon>playlist_add_check</mat-icon>
          Create All Orders
        </button>
      </div>

      <div class="stats-row">
        <mat-card class="stat-card urgent">
          <mat-card-content>
            <mat-icon>error</mat-icon>
            <div>
              <h3>{{getUrgentCount()}}</h3>
              <p>Urgent (Out of Stock)</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card warning">
          <mat-card-content>
            <mat-icon>warning</mat-icon>
            <div>
              <h3>{{getLowStockCount()}}</h3>
              <p>Low Stock</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon>pending_actions</mat-icon>
            <div>
              <h3>{{getTotalRequests()}}</h3>
              <p>Total Requests</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (getUrgentProducts().length > 0) {
        <mat-card class="urgent-section">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>error</mat-icon>
              Urgent - Out of Stock
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="products-grid">
              @for (product of getUrgentProducts(); track product.id) {
                <div class="product-card urgent-card">
                  <div class="product-header">
                    <div class="product-info">
                      <h4>{{product.name}}</h4>
                      <p class="category">{{product.category}}</p>
                    </div>
                    <mat-chip class="urgent-chip">
                      <mat-icon>error</mat-icon>
                      OUT OF STOCK
                    </mat-chip>
                  </div>

                  <div class="product-details">
                    <div class="detail-row">
                      <span class="label">Current Stock:</span>
                      <span class="value critical">{{product.currentStock}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Reorder Level:</span>
                      <span class="value">{{product.reorderLevel}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Suggested Quantity:</span>
                      <span class="value suggested">{{getSuggestedQuantity(product)}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Vendor:</span>
                      <span class="value vendor">
                        @if (product.vendorName || product.vendor?.fullName) {
                          {{product.vendorName || product.vendor?.fullName}}
                        } @else {
                          <span class="no-vendor">Not Assigned</span>
                        }
                      </span>
                    </div>
                  </div>

                  <div class="product-actions">
                    <button mat-raised-button color="warn" 
                            [disabled]="!(product.vendorId || product.vendor?.id)"
                            (click)="createPurchaseOrder(product)">
                      <mat-icon>shopping_cart</mat-icon>
                      Create Order
                    </button>
                    <button mat-button (click)="viewProduct(product)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      @if (getLowStockProducts().length > 0) {
        <mat-card class="low-stock-section">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>warning</mat-icon>
              Low Stock - Reorder Recommended
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="products-grid">
              @for (product of getLowStockProducts(); track product.id) {
                <div class="product-card low-stock-card">
                  <div class="product-header">
                    <div class="product-info">
                      <h4>{{product.name}}</h4>
                      <p class="category">{{product.category}}</p>
                    </div>
                    <mat-chip class="low-stock-chip">
                      <mat-icon>warning</mat-icon>
                      LOW STOCK
                    </mat-chip>
                  </div>

                  <div class="product-details">
                    <div class="detail-row">
                      <span class="label">Current Stock:</span>
                      <span class="value low">{{product.currentStock}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Reorder Level:</span>
                      <span class="value">{{product.reorderLevel}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Suggested Quantity:</span>
                      <span class="value suggested">{{getSuggestedQuantity(product)}} units</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Vendor:</span>
                      <span class="value vendor">
                        @if (product.vendorName || product.vendor?.fullName) {
                          {{product.vendorName || product.vendor?.fullName}}
                        } @else {
                          <span class="no-vendor">Not Assigned</span>
                        }
                      </span>
                    </div>
                  </div>

                  <div class="product-actions">
                    <button mat-raised-button color="primary" 
                            [disabled]="!(product.vendorId || product.vendor?.id)"
                            (click)="createPurchaseOrder(product)">
                      <mat-icon>shopping_cart</mat-icon>
                      Create Order
                    </button>
                    <button mat-button (click)="viewProduct(product)">
                      <mat-icon>visibility</mat-icon>
                      View Details
                    </button>
                  </div>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }

      @if (getTotalRequests() === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <div class="empty-state-content">
              <mat-icon class="success-icon">check_circle</mat-icon>
              <h2>All Good!</h2>
              <p>No reorder requests at this time. All products are adequately stocked.</p>
              <button mat-raised-button color="primary" (click)="viewInventory()">
                <mat-icon>inventory</mat-icon>
                View Inventory
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .reorder-requests {
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
      color: #11998e;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
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
      color: #11998e;
    }

    .stat-card.urgent mat-icon {
      color: #f44336;
    }

    .stat-card.warning mat-icon {
      color: #ff9800;
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

    .urgent-section,
    .low-stock-section {
      margin-bottom: 24px;
    }

    .urgent-section {
      border-left: 4px solid #f44336;
    }

    .low-stock-section {
      border-left: 4px solid #ff9800;
    }

    mat-card-header mat-card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 20px;
      font-weight: 600;
    }

    .urgent-section mat-card-title mat-icon {
      color: #f44336;
    }

    .low-stock-section mat-card-title mat-icon {
      color: #ff9800;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .product-card {
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      background: white;
    }

    .product-card.urgent-card {
      border-color: #f44336;
      background: #ffebee;
    }

    .product-card.low-stock-card {
      border-color: #ff9800;
      background: #fff3e0;
    }

    .product-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .product-info h4 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .product-info .category {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .urgent-chip {
      background: #f44336 !important;
      color: white !important;
    }

    .low-stock-chip {
      background: #ff9800 !important;
      color: white !important;
    }

    .urgent-chip mat-icon,
    .low-stock-chip mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      margin-right: 4px;
    }

    .product-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px;
      background: white;
      border-radius: 4px;
    }

    .detail-row .label {
      font-size: 14px;
      color: #666;
    }

    .detail-row .value {
      font-weight: 600;
    }

    .detail-row .value.critical {
      color: #f44336;
    }

    .detail-row .value.low {
      color: #ff9800;
    }

    .detail-row .value.suggested {
      color: #11998e;
    }

    .detail-row .value.vendor {
      color: #2196f3;
    }

    .no-vendor {
      color: #999;
      font-style: italic;
      font-weight: normal;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .product-actions button {
      flex: 1;
    }

    .empty-state mat-card-content {
      padding: 48px 24px;
    }

    .empty-state-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 16px;
    }

    .empty-state .success-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: #4caf50;
    }

    .empty-state h2 {
      margin: 0;
      font-size: 28px;
      color: #4caf50;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      color: #666;
      font-size: 16px;
      max-width: 400px;
    }

    .empty-state button {
      margin-top: 8px;
    }

    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReorderRequestsComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private purchaseOrderService: PurchaseOrderService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.filter(p => p.currentStock <= p.reorderLevel);
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  getUrgentProducts(): Product[] {
    return this.products.filter(p => p.currentStock === 0);
  }

  getLowStockProducts(): Product[] {
    return this.products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel);
  }

  getUrgentCount(): number {
    return this.getUrgentProducts().length;
  }

  getLowStockCount(): number {
    return this.getLowStockProducts().length;
  }

  getTotalRequests(): number {
    return this.products.length;
  }

  getSuggestedQuantity(product: Product): number {
    // Suggest reordering 2x the reorder level minus current stock
    const suggested = (product.reorderLevel * 2) - product.currentStock;
    return Math.max(suggested, product.reorderLevel);
  }

  createPurchaseOrder(product: Product): void {
    const vendorId = product.vendorId || product.vendor?.id;
    if (!vendorId) {
      this.snackBar.open('No vendor assigned to this product', 'Close', { duration: 3000 });
      return;
    }

    const quantity = this.getSuggestedQuantity(product);
    const orderData = {
      productId: product.id,
      vendorId: vendorId,
      quantity: quantity,
      status: 'PENDING'
    };

    this.purchaseOrderService.createPurchaseOrder(orderData).subscribe({
      next: () => {
        this.snackBar.open('Purchase order created successfully', 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error creating purchase order:', error);
        this.snackBar.open('Failed to create purchase order', 'Close', { duration: 3000 });
      }
    });
  }

  createBulkOrders(): void {
    const productsWithVendors = this.products.filter(p => p.vendorId || p.vendor?.id);
    
    if (productsWithVendors.length === 0) {
      this.snackBar.open('No products with assigned vendors', 'Close', { duration: 3000 });
      return;
    }

    let successCount = 0;
    productsWithVendors.forEach((product, index) => {
      const quantity = this.getSuggestedQuantity(product);
      const vendorId = product.vendorId || product.vendor?.id;
      const orderData = {
        productId: product.id,
        vendorId: vendorId,
        quantity: quantity,
        status: 'PENDING'
      };

      this.purchaseOrderService.createPurchaseOrder(orderData).subscribe({
        next: () => {
          successCount++;
          if (index === productsWithVendors.length - 1) {
            this.snackBar.open(
              `Successfully created ${successCount} purchase orders`, 
              'Close', 
              { duration: 3000 }
            );
            this.loadProducts();
          }
        },
        error: (error) => console.error('Error in bulk order creation:', error)
      });
    });
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/warehouse/inventory', product.id]);
  }

  viewInventory(): void {
    this.router.navigate(['/warehouse/inventory']);
  }
}
