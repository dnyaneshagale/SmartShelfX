import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Product, User } from '../../models/models';
import { ProductFormDialogComponent } from './product-form-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="products-container">
      <div class="header">
        <h1>Products</h1>
        <button mat-raised-button color="primary" (click)="addProduct()">
          <mat-icon>add</mat-icon>
          Add Product
        </button>
      </div>

      <table mat-table [dataSource]="products" class="mat-elevation-z8">
        <ng-container matColumnDef="sku">
          <th mat-header-cell *matHeaderCellDef>SKU</th>
          <td mat-cell *matCellDef="let product">{{product.sku}}</td>
        </ng-container>

        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let product">{{product.name}}</td>
        </ng-container>

        <ng-container matColumnDef="category">
          <th mat-header-cell *matHeaderCellDef>Category</th>
          <td mat-cell *matCellDef="let product">{{product.category}}</td>
        </ng-container>

        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Price</th>
          <td mat-cell *matCellDef="let product">\${{product.price}}</td>
        </ng-container>

        <ng-container matColumnDef="currentStock">
          <th mat-header-cell *matHeaderCellDef>Stock</th>
          <td mat-cell *matCellDef="let product">
            <mat-chip [class.low-stock]="product.currentStock < product.reorderLevel">
              {{product.currentStock}}
            </mat-chip>
          </td>
        </ng-container>

        <ng-container matColumnDef="reorderLevel">
          <th mat-header-cell *matHeaderCellDef>Reorder Level</th>
          <td mat-cell *matCellDef="let product">{{product.reorderLevel}}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let product">
            <button mat-icon-button (click)="editProduct(product)" matTooltip="Edit">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button (click)="viewForecast(product)" matTooltip="View Forecast">
              <mat-icon>analytics</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteProduct(product)" matTooltip="Delete">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .products-container {
      padding: 20px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    table {
      width: 100%;
    }

    .low-stock {
      background-color: #ffcdd2 !important;
    }
  `]
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  vendors: User[] = [];
  displayedColumns = ['sku', 'name', 'category', 'price', 'currentStock', 'reorderLevel', 'actions'];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadVendors();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => this.products = products,
      error: (error) => {
        console.error('Error loading products:', error);
        this.snackBar.open('Failed to load products', 'Close', { duration: 3000 });
      }
    });
  }

  loadVendors(): void {
    this.userService.getVendors().subscribe({
      next: (vendors) => this.vendors = vendors,
      error: (error) => console.error('Error loading vendors:', error)
    });
  }

  addProduct(): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { vendors: this.vendors }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Convert vendorId to vendor object if needed
        const productData = { ...result };
        if (result.vendorId) {
          productData.vendor = { id: result.vendorId };
        }
        
        this.productService.createProduct(productData).subscribe({
          next: (product) => {
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

  editProduct(product: Product): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '500px',
      data: { product, vendors: this.vendors }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && product.id) {
        // Convert vendorId to vendor object if needed
        const productData = { ...result };
        if (result.vendorId) {
          productData.vendor = { id: result.vendorId };
        }
        
        this.productService.updateProduct(product.id, productData).subscribe({
          next: (updatedProduct) => {
            this.snackBar.open('Product updated successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.snackBar.open('Failed to update product', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      if (product.id) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.snackBar.open('Product deleted successfully', 'Close', { duration: 3000 });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.snackBar.open('Failed to delete product', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  viewForecast(product: Product): void {
    this.router.navigate(['/forecast'], { queryParams: { sku: product.sku } });
  }
}
