import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../models/models';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
    ReactiveFormsModule
  ],
  template: `
    <div class="inventory-list">
      <div class="header">
        <h1>Inventory Management</h1>
        <div class="actions">
          <button mat-raised-button (click)="addNewProduct()">
            <mat-icon>add_box</mat-icon>
            Add Product
          </button>
          <button mat-raised-button color="primary" (click)="navigateToStockIn()">
            <mat-icon>add_circle</mat-icon>
            Stock IN
          </button>
          <button mat-raised-button color="accent" (click)="navigateToStockOut()">
            <mat-icon>remove_circle</mat-icon>
            Stock OUT
          </button>
        </div>
      </div>

      <div class="stats-grid">
        <mat-card class="stat-card">
          <mat-card-content>
            <mat-icon class="stat-icon">inventory_2</mat-icon>
            <div class="stat-info">
              <h3>{{getTotalProducts()}}</h3>
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
            <mat-icon class="stat-icon out-stock">cancel</mat-icon>
            <div class="stat-info">
              <h3>{{getOutOfStockCount()}}</h3>
              <p>Out of Stock</p>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="filters-card">
        <mat-card-content>
          <div class="filters">
            <mat-form-field appearance="outline">
              <mat-label>Search</mat-label>
              <input matInput [(ngModel)]="searchText" (ngModelChange)="applyFilters()" 
                     placeholder="Search by product name...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategory" (selectionChange)="applyFilters()">
                <mat-option value="all">All Categories</mat-option>
                @for (category of categories; track category) {
                  <mat-option [value]="category">{{category}}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Stock Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus" (selectionChange)="applyFilters()">
                <mat-option value="all">All Status</mat-option>
                <mat-option value="in-stock">In Stock</mat-option>
                <mat-option value="low-stock">Low Stock</mat-option>
                <mat-option value="out-of-stock">Out of Stock</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-content>
          <div class="table-container">
            <table class="inventory-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>SKU</th>
                  <th>Current Stock</th>
                  <th>Reorder Level</th>
                  <th>Status</th>
                  <th>Vendor</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredProducts.length === 0) {
                  <tr>
                    <td colspan="8" class="no-data">No products found</td>
                  </tr>
                }
                @for (product of filteredProducts; track product.id) {
                  <tr [class]="getRowClass(product)">
                    <td>
                      <div class="product-name">
                        <mat-icon>inventory</mat-icon>
                        {{product.name}}
                      </div>
                    </td>
                    <td>{{product.category}}</td>
                    <td><code>{{product.sku}}</code></td>
                    <td>
                      <span class="stock-value" [class]="getStockClass(product)">
                        {{product.currentStock}} units
                      </span>
                    </td>
                    <td>{{product.reorderLevel}} units</td>
                    <td>
                      <mat-chip [class]="getStatusChipClass(product)">
                        {{getStockStatus(product)}}
                      </mat-chip>
                    </td>
                    <td>
                      @if (product.vendorName || product.vendor?.fullName) {
                        <span class="vendor-name">{{product.vendorName || product.vendor?.fullName}}</span>
                      } @else {
                        <span class="no-vendor">Not Assigned</span>
                      }
                    </td>
                    <td class="actions">
                      <button mat-icon-button color="accent" (click)="stockIn(product)">
                        <mat-icon>add</mat-icon>
                      </button>
                      <button mat-icon-button (click)="stockOut(product)">
                        <mat-icon>remove</mat-icon>
                      </button>
                      @if (product.currentStock <= product.reorderLevel) {
                        <button mat-icon-button color="warn" (click)="createReorder(product)">
                          <mat-icon>notification_important</mat-icon>
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
    </div>
  `,
  styles: [`
    .inventory-list {
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

    .actions {
      display: flex;
      gap: 12px;
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
      color: #11998e;
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

    .filters-card {
      margin-bottom: 24px;
    }

    .filters {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .filters mat-form-field {
      min-width: 200px;
      flex: 1;
    }

    .table-container {
      overflow-x: auto;
    }

    .inventory-table {
      width: 100%;
      border-collapse: collapse;
    }

    .inventory-table th {
      background: #f5f5f5;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }

    .inventory-table td {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .inventory-table tbody tr:hover {
      background: #f9f9f9;
    }

    .inventory-table tr.low-stock-row {
      background: #fff3e0;
    }

    .inventory-table tr.out-of-stock-row {
      background: #ffebee;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 48px !important;
    }

    .product-name {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .product-name mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: #11998e;
    }

    code {
      background: #f5f5f5;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
    }

    .stock-value {
      font-weight: 600;
    }

    .stock-value.stock-normal {
      color: #4caf50;
    }

    .stock-value.stock-low {
      color: #ff9800;
    }

    .stock-value.stock-out {
      color: #f44336;
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

    .vendor-name {
      color: #11998e;
      font-weight: 500;
    }

    .no-vendor {
      color: #999;
      font-style: italic;
    }

    .actions {
      display: flex;
      gap: 4px;
    }

    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .filters {
        flex-direction: column;
      }

      .filters mat-form-field {
        width: 100%;
      }

      .inventory-table {
        font-size: 14px;
      }

      .inventory-table th,
      .inventory-table td {
        padding: 12px 8px;
      }
    }
  `]
})
export class InventoryListComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  
  searchText: string = '';
  selectedCategory: string = 'all';
  selectedStatus: string = 'all';

  constructor(
    private productService: ProductService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.extractCategories();
        this.applyFilters();
      },
      error: (error) => console.error('Error loading products:', error)
    });
  }

  extractCategories(): void {
    const categorySet = new Set(this.products.map(p => p.category));
    this.categories = Array.from(categorySet).sort();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchText || 
        product.name.toLowerCase().includes(this.searchText.toLowerCase());
      
      const matchesCategory = this.selectedCategory === 'all' || 
        product.category === this.selectedCategory;
      
      const matchesStatus = this.selectedStatus === 'all' || 
        this.checkStatusMatch(product, this.selectedStatus);
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  checkStatusMatch(product: Product, status: string): boolean {
    if (status === 'out-of-stock') return product.currentStock === 0;
    if (status === 'low-stock') return product.currentStock > 0 && product.currentStock <= product.reorderLevel;
    if (status === 'in-stock') return product.currentStock > product.reorderLevel;
    return true;
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  getTotalProducts(): number {
    return this.products.length;
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

  getStockClass(product: Product): string {
    if (product.currentStock === 0) return 'stock-out';
    if (product.currentStock <= product.reorderLevel) return 'stock-low';
    return 'stock-normal';
  }

  getStatusChipClass(product: Product): string {
    if (product.currentStock === 0) return 'status-out-of-stock';
    if (product.currentStock <= product.reorderLevel) return 'status-low-stock';
    return 'status-in-stock';
  }

  getRowClass(product: Product): string {
    if (product.currentStock === 0) return 'out-of-stock-row';
    if (product.currentStock <= product.reorderLevel) return 'low-stock-row';
    return '';
  }

  viewDetails(product: Product): void {
    this.router.navigate(['/warehouse/inventory', product.id]);
  }

  stockIn(product: Product): void {
    this.router.navigate(['/warehouse/stock'], { 
      queryParams: { productId: product.id, type: 'IN' } 
    });
  }

  stockOut(product: Product): void {
    this.router.navigate(['/warehouse/stock'], { 
      queryParams: { productId: product.id, type: 'OUT' } 
    });
  }

  createReorder(product: Product): void {
    this.router.navigate(['/warehouse/reorder'], { 
      queryParams: { productId: product.id } 
    });
  }

  navigateToStockIn(): void {
    this.router.navigate(['/warehouse/stock'], { queryParams: { type: 'IN' } });
  }

  navigateToStockOut(): void {
    this.router.navigate(['/warehouse/stock'], { queryParams: { type: 'OUT' } });
  }

  addNewProduct(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      width: '600px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.productService.createProduct(result).subscribe({
          next: () => {
            this.snackBar.open('Product created successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.snackBar.open('Failed to create product', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}

// Dialog Component for Adding Products
@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Product</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm">
        <mat-form-field appearance="outline">
          <mat-label>Product Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter product name" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>SKU</mat-label>
          <input matInput formControlName="sku" placeholder="e.g., PROD-001" required>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="Electronics">Electronics</mat-option>
            <mat-option value="Furniture">Furniture</mat-option>
            <mat-option value="Office Supplies">Office Supplies</mat-option>
            <mat-option value="Food & Beverages">Food & Beverages</mat-option>
            <mat-option value="Clothing">Clothing</mat-option>
            <mat-option value="Tools">Tools</mat-option>
            <mat-option value="Sports">Sports</mat-option>
            <mat-option value="Healthcare">Healthcare</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3" 
                    placeholder="Enter product description"></textarea>
        </mat-form-field>

        <div class=\"form-row\">
          <mat-form-field appearance=\"outline\">
            <mat-label>Current Stock</mat-label>
            <input matInput type=\"number\" formControlName=\"currentStock\" 
                   placeholder=\"0\" min=\"0\" required>
          </mat-form-field>

          <mat-form-field appearance=\"outline\">
            <mat-label>Reorder Level</mat-label>
            <input matInput type=\"number\" formControlName=\"reorderLevel\" 
                   placeholder=\"0\" min=\"0\" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance=\"outline\">
          <mat-label>Unit Price</mat-label>
          <input matInput type=\"number\" formControlName=\"price\" 
                 placeholder=\"0.00\" min=\"0\" step=\"0.01\">
          <span matPrefix>$&nbsp;</span>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align=\"end\">
      <button mat-button (click)=\"onCancel()\">Cancel</button>
      <button mat-raised-button color=\"primary\" 
              [disabled]=\"!productForm.valid\" 
              (click)=\"onSave()\">
        Add Product
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 500px;
      padding: 20px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    mat-form-field {
      width: 100%;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    mat-dialog-actions {
      padding: 16px;
      gap: 12px;
    }
  `]
})
export class AddProductDialogComponent {
  productForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddProductDialogComponent>,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      sku: ['', Validators.required],
      category: ['', Validators.required],
      description: [''],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [0, [Validators.required, Validators.min(0)]],
      price: [0, [Validators.min(0)]]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }
}
