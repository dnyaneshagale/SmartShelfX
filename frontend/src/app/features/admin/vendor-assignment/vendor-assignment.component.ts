import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductService } from '../../../services/product.service';
import { UserService } from '../../../services/user.service';
import { Product, User } from '../../../models/models';

@Component({
  selector: 'app-vendor-assignment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    FormsModule,
    MatChipsModule,
    MatSnackBarModule
  ],
  template: `
    <div class="vendor-assignment">
      <div class="header">
        <h1>Vendor Assignment</h1>
        <button mat-raised-button color="primary" (click)="bulkAssignMode = !bulkAssignMode">
          <mat-icon>{{bulkAssignMode ? 'close' : 'playlist_add'}}</mat-icon>
          {{bulkAssignMode ? 'Cancel Bulk' : 'Bulk Assign'}}
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
            <mat-icon class="stat-icon assigned">store</mat-icon>
            <div class="stat-info">
              <h3>{{getAssignedProducts().length}}</h3>
              <p>Assigned</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon unassigned">warning</mat-icon>
            <div class="stat-info">
              <h3>{{getUnassignedProducts().length}}</h3>
              <p>Unassigned</p>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon">people</mat-icon>
            <div class="stat-info">
              <h3>{{vendors.length}}</h3>
              <p>Active Vendors</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      @if (bulkAssignMode) {
        <mat-card class="bulk-assign-card">
          <mat-card-content>
            <h3>Bulk Vendor Assignment</h3>
            <div class="bulk-form">
              <mat-form-field appearance="outline">
                <mat-label>Select Vendor</mat-label>
                <mat-select [(ngModel)]="selectedBulkVendor">
                  @for (vendor of vendors; track vendor.id) {
                    <mat-option [value]="vendor.id">
                      {{vendor.fullName}} ({{vendor.username}})
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
              <button mat-raised-button color="primary" 
                      [disabled]="!selectedBulkVendor || getUnassignedProducts().length === 0"
                      (click)="assignAllUnassigned()">
                Assign All Unassigned Products
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      }

      <mat-card>
        <mat-card-content>
          <div class="filter-section">
            <mat-form-field appearance="outline">
              <mat-label>Filter by Status</mat-label>
              <mat-select [(ngModel)]="filterStatus" (selectionChange)="applyFilter()">
                <mat-option value="all">All Products</mat-option>
                <mat-option value="assigned">Assigned Only</mat-option>
                <mat-option value="unassigned">Unassigned Only</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Filter by Category</mat-label>
              <mat-select [(ngModel)]="filterCategory" (selectionChange)="applyFilter()">
                <mat-option value="all">All Categories</mat-option>
                @for (category of categories; track category) {
                  <mat-option [value]="category">{{category}}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table class="assignment-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Current Vendor</th>
                  <th>Assign Vendor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredProducts.length === 0) {
                  <tr>
                    <td colspan="6" class="no-data">No products found</td>
                  </tr>
                }
                @for (product of filteredProducts; track product.id) {
                  <tr>
                    <td>{{product.name}}</td>
                    <td>{{product.category}}</td>
                    <td>
                      <span [class]="getStockClass(product)">
                        {{product.currentStock}} units
                      </span>
                    </td>
                    <td>
                      @if (product.vendorId) {
                        <mat-chip class="vendor-chip">
                          {{product.vendorName}}
                        </mat-chip>
                      } @else {
                        <mat-chip class="unassigned-chip">Unassigned</mat-chip>
                      }
                    </td>
                    <td>
                      <mat-form-field appearance="outline" class="vendor-select">
                        <mat-select [(ngModel)]="product.vendorId" 
                                    (selectionChange)="onVendorChange(product)">
                          <mat-option [value]="null">-- Unassigned --</mat-option>
                          @for (vendor of vendors; track vendor.id) {
                            <mat-option [value]="vendor.id">
                              {{vendor.fullName}}
                            </mat-option>
                          }
                        </mat-select>
                      </mat-form-field>
                    </td>
                    <td class="actions">
                      <button mat-icon-button color="primary" 
                              (click)="saveAssignment(product)"
                              [disabled]="!product.vendorId">
                        <mat-icon>save</mat-icon>
                      </button>
                      @if (product.vendorId) {
                        <button mat-icon-button color="warn" 
                                (click)="removeAssignment(product)">
                          <mat-icon>delete</mat-icon>
                        </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card class="vendor-list-card">
        <mat-card-header>
          <mat-card-title>Vendor Overview</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="vendor-list">
            @for (vendor of vendors; track vendor.id) {
              <div class="vendor-item">
                <div class="vendor-info">
                  <mat-icon>store</mat-icon>
                  <div>
                    <h4>{{vendor.fullName}}</h4>
                    <p>{{vendor.email}}</p>
                  </div>
                </div>
                <div class="vendor-stats">
                  <mat-chip>
                    {{getVendorProductCount(vendor.id)}} Products
                  </mat-chip>
                </div>
              </div>
            }
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .vendor-assignment {
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
      color: #667eea;
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
      color: #667eea;
    }

    .stat-icon.assigned {
      color: #4caf50;
    }

    .stat-icon.unassigned {
      color: #ff9800;
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

    .bulk-assign-card {
      margin-bottom: 24px;
      background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
    }

    .bulk-assign-card h3 {
      margin: 0 0 16px 0;
      color: #667eea;
    }

    .bulk-form {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .bulk-form mat-form-field {
      flex: 1;
      max-width: 400px;
    }

    .filter-section {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .filter-section mat-form-field {
      max-width: 300px;
      flex: 1;
      min-width: 200px;
    }

    .table-container {
      overflow-x: auto;
    }

    .assignment-table {
      width: 100%;
      border-collapse: collapse;
    }

    .assignment-table th {
      background: #f5f5f5;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }

    .assignment-table td {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .assignment-table tbody tr:hover {
      background: #f9f9f9;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 48px !important;
    }

    .stock-normal {
      color: #4caf50;
      font-weight: 500;
    }

    .stock-low {
      color: #ff9800;
      font-weight: 500;
    }

    .stock-critical {
      color: #f44336;
      font-weight: 600;
    }

    .vendor-chip {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
    }

    .unassigned-chip {
      background-color: #ffecb3 !important;
      color: #f57c00 !important;
    }

    .vendor-select {
      width: 200px;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .vendor-list-card {
      margin-top: 24px;
    }

    .vendor-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .vendor-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .vendor-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .vendor-info mat-icon {
      color: #667eea;
    }

    .vendor-info h4 {
      margin: 0;
      font-size: 16px;
    }

    .vendor-info p {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #666;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .bulk-form {
        flex-direction: column;
      }

      .bulk-form mat-form-field {
        max-width: 100%;
      }
    }
  `]
})
export class VendorAssignmentComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  vendors: User[] = [];
  categories: string[] = [];
  filterStatus: string = 'all';
  filterCategory: string = 'all';
  bulkAssignMode: boolean = false;
  selectedBulkVendor?: number;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadVendors();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        // Map vendor object to vendorId and vendorName for easy display
        this.products = products.map(p => ({
          ...p,
          vendorId: p.vendor?.id || p.vendorId,
          vendorName: p.vendor?.fullName || p.vendorName
        }));
        console.log('Loaded products with vendor mapping:', this.products);
        this.extractCategories();
        this.applyFilter();
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  extractCategories(): void {
    // Get unique categories from products
    const uniqueCategories = new Set(this.products.map(p => p.category).filter(c => c));
    this.categories = Array.from(uniqueCategories).sort();
  }

  loadVendors(): void {
    this.userService.getUsersByRole('VENDOR').subscribe({
      next: (vendors) => {
        this.vendors = vendors.map(v => ({
          ...v,
          assignedProducts: 0
        }));
      },
      error: (error) => console.error('Error loading vendors:', error)
    });
  }

  applyFilter(): void {
    let filtered = [...this.products];

    // Apply status filter
    if (this.filterStatus === 'assigned') {
      filtered = filtered.filter(p => p.vendorId);
    } else if (this.filterStatus === 'unassigned') {
      filtered = filtered.filter(p => !p.vendorId);
    }

    // Apply category filter
    if (this.filterCategory && this.filterCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.filterCategory);
    }

    this.filteredProducts = filtered;
  }

  getAssignedProducts(): Product[] {
    return this.products.filter(p => p.vendorId);
  }

  getUnassignedProducts(): Product[] {
    return this.products.filter(p => !p.vendorId);
  }

  getStockClass(product: Product): string {
    if (product.currentStock <= 0) return 'stock-critical';
    if (product.currentStock <= product.reorderLevel) return 'stock-low';
    return 'stock-normal';
  }

  getVendorProductCount(vendorId: number): number {
    return this.products.filter(p => p.vendorId === vendorId).length;
  }

  onVendorChange(product: Product): void {
    // Update vendor name for display
    if (product.vendorId) {
      const vendor = this.vendors.find(v => v.id === product.vendorId);
      product.vendorName = vendor?.fullName;
    } else {
      product.vendorName = undefined;
    }
  }

  saveAssignment(product: Product): void {
    if (!product.vendorId) return;

    console.log('Assigning vendor:', product.vendorId, 'to product:', product.id);
    this.productService.assignVendor(product.id!, product.vendorId).subscribe({
      next: (updatedProduct) => {
        console.log('Vendor assigned successfully:', updatedProduct);
        this.snackBar.open('Vendor assigned successfully', 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error assigning vendor:', error);
        this.snackBar.open('Failed to assign vendor', 'Close', { duration: 3000 });
      }
    });
  }

  removeAssignment(product: Product): void {
    console.log('Removing vendor from product:', product.id);
    this.productService.assignVendor(product.id!, null).subscribe({
      next: (updatedProduct) => {
        console.log('Vendor removed successfully:', updatedProduct);
        product.vendorId = undefined;
        product.vendorName = undefined;
        this.snackBar.open('Vendor removed successfully', 'Close', { duration: 3000 });
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error removing vendor:', error);
        this.snackBar.open('Failed to remove vendor', 'Close', { duration: 3000 });
      }
    });
  }

  assignAllUnassigned(): void {
    if (!this.selectedBulkVendor) return;

    const unassignedProducts = this.getUnassignedProducts();
    let successCount = 0;
    const totalCount = unassignedProducts.length;

    console.log('Bulk assigning vendor:', this.selectedBulkVendor, 'to', totalCount, 'products');

    unassignedProducts.forEach((product, index) => {
      this.productService.assignVendor(product.id!, this.selectedBulkVendor!).subscribe({
        next: (updatedProduct) => {
          successCount++;
          console.log(`Assigned ${successCount}/${totalCount}:`, updatedProduct);
          if (successCount === totalCount) {
            this.snackBar.open(
              `Successfully assigned ${successCount} products`, 
              'Close', 
              { duration: 3000 }
            );
            this.bulkAssignMode = false;
            this.selectedBulkVendor = undefined;
            this.loadProducts();
          }
        },
        error: (error) => {
          console.error('Error in bulk assignment for product', product.id, ':', error);
          // Continue with remaining products even if one fails
          if (index === totalCount - 1 && successCount > 0) {
            this.snackBar.open(
              `Assigned ${successCount} of ${totalCount} products`, 
              'Close', 
              { duration: 3000 }
            );
            this.bulkAssignMode = false;
            this.selectedBulkVendor = undefined;
            this.loadProducts();
          }
        }
      });
    });
  }
}
