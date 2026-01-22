import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models/models';

@Component({
  selector: 'app-my-products',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  template: `
    <div class="my-products">
      <div class="header">
        <h1>My Assigned Products</h1>
        <button mat-raised-button color="primary" (click)="viewOrders()">
          <mat-icon>shopping_bag</mat-icon>
          View Orders
        </button>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon">inventory_2</mat-icon>
            <div class="stat-info">
              <h3>{{products.length}}</h3>
              <p>Total Products</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon in-stock">check_circle</mat-icon>
            <div class="stat-info">
              <h3>{{getInStockCount()}}</h3>
              <p>In Stock</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon low-stock">warning</mat-icon>
            <div class="stat-info">
              <h3>{{getLowStockCount()}}</h3>
              <p>Low Stock</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon out-stock">error</mat-icon>
            <div class="stat-info">
              <h3>{{getOutOfStockCount()}}</h3>
              <p>Out of Stock</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="search-card">
        <mat-card-content>
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search Products</mat-label>
            <input matInput [(ngModel)]="searchText" (ngModelChange)="applySearch()" 
                   placeholder="Search by product name or category...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      @if (filteredProducts.length === 0) {
        <mat-card class="empty-state">
          <mat-card-content>
            <mat-icon>inventory</mat-icon>
            <h2>No Products Assigned</h2>
            <p>You don't have any products assigned yet. Contact the administrator for product assignments.</p>
          </mat-card-content>
        </mat-card>
      } @else {
        <div class="products-grid">
          @for (product of filteredProducts; track product.id) {
            <mat-card class="product-card" [class]="getCardClass(product)">
              <mat-card-header>
                <div class="product-title">
                  <h3>{{product.name}}</h3>
                  <mat-chip [class]="getStatusChipClass(product)">
                    {{getStockStatus(product)}}
                  </mat-chip>
                </div>
              </mat-card-header>

              <mat-card-content>
                <div class="product-image">
                  <mat-icon>inventory_2</mat-icon>
                </div>

                <div class="product-details">
                  <div class="detail-row">
                    <span class="label">Category:</span>
                    <span class="value">{{product.category}}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">SKU:</span>
                    <span class="value"><code>{{product.sku}}</code></span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Current Stock:</span>
                    <span class="value" [class]="getStockValueClass(product)">
                      {{product.currentStock}} units
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Reorder Level:</span>
                    <span class="value">{{product.reorderLevel}} units</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Price:</span>
                    <span class="value price">&#36;{{product.price || '0.00'}}</span>
                  </div>
                </div>

                @if (product.currentStock <= product.reorderLevel) {
                  <div class="alert-section">
                    <mat-icon>notification_important</mat-icon>
                    <div>
                      <strong>Reorder Alert!</strong>
                      <p>This product needs restocking. Check for pending orders.</p>
                    </div>
                  </div>
                }
              </mat-card-content>

              <mat-card-actions>
                <button mat-button color="primary" (click)="viewOrderHistory(product)">
                  <mat-icon>history</mat-icon>
                  Order History
                </button>
                <button mat-button (click)="viewDetails(product)">
                  <mat-icon>visibility</mat-icon>
                  Details
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .my-products {
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

    .stat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #f5576c;
    }

    .stat-icon.in-stock {
      color: #4caf50;
    }

    .stat-icon.low-stock {
      color: #ff9800;
    }

    .stat-icon.out-stock {
      color: #f44336;
    }

    .stat-info h3 {
      margin: 0;
      font-size: 32px;
      font-weight: 600;
    }

    .stat-info p {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .search-card {
      margin-bottom: 24px;
    }

    .search-field {
      width: 100%;
    }

    .empty-state mat-card-content {
      text-align: center;
      padding: 64px 24px;
    }

    .empty-state mat-icon {
      font-size: 96px;
      width: 96px;
      height: 96px;
      color: #f5576c;
      margin-bottom: 16px;
    }

    .empty-state h2 {
      margin: 0 0 8px 0;
      font-size: 32px;
      color: #f5576c;
    }

    .empty-state p {
      margin: 0;
      color: #666;
      font-size: 16px;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }

    .product-card {
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .product-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .product-card.low-stock {
      border-left: 4px solid #ff9800;
    }

    .product-card.out-of-stock {
      border-left: 4px solid #f44336;
    }

    .product-title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-title h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .status-in-stock {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .status-low-stock {
      background-color: #ffe0b2 !important;
      color: #e65100 !important;
    }

    .status-out-of-stock {
      background-color: #ffcdd2 !important;
      color: #c62828 !important;
    }

    .product-image {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 120px;
      background: linear-gradient(135deg, #f093fb20 0%, #f5576c20 100%);
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .product-image mat-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: #f5576c;
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
      background: #f9f9f9;
      border-radius: 4px;
    }

    .detail-row .label {
      font-size: 14px;
      color: #666;
    }

    .detail-row .value {
      font-weight: 600;
    }

    code {
      background: #e0e0e0;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }

    .stock-normal {
      color: #4caf50;
    }

    .stock-low {
      color: #ff9800;
    }

    .stock-out {
      color: #f44336;
    }

    .price {
      color: #f5576c;
      font-size: 16px;
    }

    .alert-section {
      display: flex;
      gap: 12px;
      padding: 12px;
      background: #fff3e0;
      border-radius: 8px;
      border-left: 4px solid #ff9800;
      margin-top: 16px;
    }

    .alert-section mat-icon {
      color: #ff9800;
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .alert-section strong {
      display: block;
      margin-bottom: 4px;
      color: #e65100;
    }

    .alert-section p {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    mat-card-actions {
      display: flex;
      justify-content: space-between;
      padding: 16px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .products-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchText: string = '';
  vendorId: number = 0;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    console.log('MyProducts - Current User:', user);
    if (user?.id) {
      this.vendorId = user.id;
      console.log('MyProducts - Vendor ID:', this.vendorId);
      this.loadProducts();
    } else {
      console.error('MyProducts - No user ID found!', user);
    }
  }

  loadProducts(): void {
    console.log('MyProducts - Loading products for vendor:', this.vendorId);
    this.productService.getProductsByVendor(this.vendorId).subscribe({
      next: (products) => {
        console.log('MyProducts - Received products:', products);
        this.products = products;
        this.applySearch();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        console.error('Error details:', JSON.stringify(error));
      }
    });
  }

  applySearch(): void {
    if (!this.searchText) {
      this.filteredProducts = [...this.products];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredProducts = this.products.filter(p => 
        p.name.toLowerCase().includes(search) || 
        p.category.toLowerCase().includes(search)
      );
    }
  }

  getInStockCount(): number {
    return this.products.filter(p => p.currentStock > p.reorderLevel).length;
  }

  getLowStockCount(): number {
    return this.products.filter(p => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;
  }

  getOutOfStockCount(): number {
    return this.products.filter(p => p.currentStock === 0).length;
  }

  getStockStatus(product: Product): string {
    if (product.currentStock === 0) return 'Out of Stock';
    if (product.currentStock <= product.reorderLevel) return 'Low Stock';
    return 'In Stock';
  }

  getStatusChipClass(product: Product): string {
    if (product.currentStock === 0) return 'status-out-of-stock';
    if (product.currentStock <= product.reorderLevel) return 'status-low-stock';
    return 'status-in-stock';
  }

  getStockValueClass(product: Product): string {
    if (product.currentStock === 0) return 'stock-out';
    if (product.currentStock <= product.reorderLevel) return 'stock-low';
    return 'stock-normal';
  }

  getCardClass(product: Product): string {
    if (product.currentStock === 0) return 'out-of-stock';
    if (product.currentStock <= product.reorderLevel) return 'low-stock';
    return '';
  }

  viewOrderHistory(product: Product): void {
    this.router.navigate(['/vendor/purchase-orders'], { 
      queryParams: { productId: product.id } 
    });
  }

  viewDetails(product: Product): void {
    // Navigate to product details or open dialog
    console.log('View details for product:', product);
  }

  viewOrders(): void {
    this.router.navigate(['/vendor/purchase-orders']);
  }
}
