import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category, StockStatus, ProductFilter } from '../../../core/models';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatInputModule, MatFormFieldModule, MatSelectModule, MatChipsModule, MatMenuModule, MatCardModule, MatProgressSpinnerModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  displayedColumns = ['name', 'sku', 'category', 'currentStock', 'stockStatus', 'unitPrice', 'actions'];
  dataSource = new MatTableDataSource<Product>();
  categories: Category[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedStatus: StockStatus | null = null;

  private productService = inject(ProductService);
  private authService = inject(AuthService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => {
        this.dataSource.data = products;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: Category[]) => this.categories = categories
    });
  }

  applyFilter(): void {
    const filter: ProductFilter = {};
    if (this.searchTerm) filter.searchTerm = this.searchTerm;
    if (this.selectedCategory) filter.categoryId = this.selectedCategory;
    if (this.selectedStatus) filter.stockStatus = this.selectedStatus;

    this.productService.filterProducts(filter).subscribe({
      next: (products: Product[]) => this.dataSource.data = products
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = null;
    this.selectedStatus = null;
    this.loadProducts();
  }

  deleteProduct(product: Product): void {
    if (confirm(`Are you sure you want to delete ${product.name}?`)) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => this.loadProducts()
      });
    }
  }

  exportToCsv(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Current user not found');
      return;
    }

    // Filter products for current user before export
    const userProducts = this.dataSource.data;

    if (userProducts.length === 0) {
      alert('No products to export');
      return;
    }

    // Create CSV content
    const headers = ['Name', 'SKU', 'Category', 'Stock', 'Status', 'Price'];
    const rows = userProducts.map(p => [
      p.name,
      p.sku,
      p.categoryName || '',
      p.currentStock || 0,
      p.stockStatus || '',
      p.unitPrice || 0
    ]);

    let csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `products-${currentUser.username}-${new Date().getTime()}.csv`;
    saveAs(blob, filename);
  }

  getStatusColor(status: StockStatus): string {
    switch (status) {
      case 'IN_STOCK': return 'primary';
      case 'LOW_STOCK': return 'warn';
      case 'OUT_OF_STOCK': return 'accent';
      default: return 'primary';
    }
  }
}
