import { Component, OnInit, ViewChild } from '@angular/core';
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
  displayedColumns = ['name', 'sku', 'category', 'quantity', 'status', 'unitPrice', 'actions'];
  dataSource = new MatTableDataSource<Product>();
  categories: Category[] = [];
  isLoading = true;
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedStatus: StockStatus | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productService: ProductService) {}

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
    if (this.selectedStatus) filter.status = this.selectedStatus;
    
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
    this.productService.exportCsv().subscribe({
      next: (blob: Blob) => {
        saveAs(blob, 'products.csv');
      }
    });
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
