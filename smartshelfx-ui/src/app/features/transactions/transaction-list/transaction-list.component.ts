import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { TransactionService } from '../../../core/services/transaction.service';
import { ProductService } from '../../../core/services/product.service';
import { StockMovement, Product, MovementType } from '../../../core/models';
import { StockDialogComponent, StockDialogData } from '../stock-dialog/stock-dialog.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatCardModule, MatChipsModule, MatDialogModule, MatProgressSpinnerModule, MatSnackBarModule, FormsModule],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit {
  displayedColumns = ['createdAt', 'product', 'movementType', 'quantity', 'previousQuantity', 'newQuantity', 'performedBy'];
  dataSource = new MatTableDataSource<StockMovement>();
  products: Product[] = [];
  isLoading = true;
  selectedProductId: number | null = null;
  selectedType: MovementType | null = null;
  movementTypes: MovementType[] = ['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'TRANSFER', 'RETURN'];

  // Pagination
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private transactionService: TransactionService,
    private productService: ProductService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadTransactions();
    this.loadProducts();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadTransactions(): void {
    this.isLoading = true;
    this.transactionService.getAllMovements(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => this.products = products
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  applyFilters(): void {
    this.isLoading = true;

    if (this.selectedProductId) {
      this.transactionService.getMovementsByProduct(this.selectedProductId, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.dataSource.data = page.content;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else if (this.selectedType) {
      this.transactionService.getMovementsByType(this.selectedType, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.dataSource.data = page.content;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      this.loadTransactions();
    }
  }

  filterByProduct(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  filterByType(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  clearFilters(): void {
    this.selectedProductId = null;
    this.selectedType = null;
    this.currentPage = 0;
    this.loadTransactions();
  }

  getMovementTypeColor(type: MovementType): string {
    switch (type) {
      case 'STOCK_IN': return 'primary';
      case 'STOCK_OUT': return 'warn';
      case 'ADJUSTMENT': return 'accent';
      default: return 'primary';
    }
  }

  getMovementIcon(type: MovementType): string {
    switch (type) {
      case 'STOCK_IN': return 'add_circle';
      case 'STOCK_OUT': return 'remove_circle';
      case 'ADJUSTMENT': return 'tune';
      case 'TRANSFER': return 'swap_horiz';
      case 'RETURN': return 'undo';
      default: return 'info';
    }
  }

  openStockInDialog(): void {
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '500px',
      data: { type: 'STOCK_IN' } as StockDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Stock added successfully!', 'Close', { duration: 3000 });
        this.loadTransactions();
      }
    });
  }

  openStockOutDialog(): void {
    const dialogRef = this.dialog.open(StockDialogComponent, {
      width: '500px',
      data: { type: 'STOCK_OUT' } as StockDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Stock removed successfully!', 'Close', { duration: 3000 });
        this.loadTransactions();
      }
    });
  }
}
