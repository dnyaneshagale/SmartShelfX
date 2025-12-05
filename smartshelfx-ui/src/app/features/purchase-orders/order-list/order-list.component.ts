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
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../../core/services/purchase-order.service';
import { ReorderRequest, ReorderStatus } from '../../../core/models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatCardModule, MatChipsModule, MatMenuModule, MatProgressSpinnerModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss'
})
export class OrderListComponent implements OnInit {
  displayedColumns = ['id', 'product', 'requestedQuantity', 'status', 'priority', 'requestedBy', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<ReorderRequest>();
  isLoading = true;
  selectedStatus: ReorderStatus | null = null;
  statuses: ReorderStatus[] = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED', 'CLOSED'];

  // Pagination
  totalElements = 0;
  pageSize = 20;
  currentPage = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private orderService: PurchaseOrderService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  loadOrders(): void {
    this.isLoading = true;
    this.orderService.getAllReorderRequests(this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.dataSource.data = page.content;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.applyFilters();
  }

  applyFilters(): void {
    this.isLoading = true;
    if (this.selectedStatus) {
      this.orderService.getReorderRequestsByStatus(this.selectedStatus, this.currentPage, this.pageSize).subscribe({
        next: (page) => {
          this.dataSource.data = page.content;
          this.totalElements = page.totalElements;
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    } else {
      this.loadOrders();
    }
  }

  filterByStatus(): void {
    this.currentPage = 0;
    this.applyFilters();
  }

  approveOrder(order: ReorderRequest): void {
    this.orderService.approveReorder(order.id).subscribe({ next: () => this.loadOrders() });
  }

  rejectOrder(order: ReorderRequest): void {
    const reason = prompt('Enter rejection reason:');
    if (reason) {
      this.orderService.rejectReorder(order.id, reason).subscribe({ next: () => this.loadOrders() });
    }
  }

  markAsReceived(order: ReorderRequest): void {
    this.orderService.markAsReceived(order.id).subscribe({ next: () => this.loadOrders() });
  }

  getStatusColor(status: ReorderStatus): string {
    switch (status) {
      case 'DRAFT': return 'accent';
      case 'PENDING': return 'accent';
      case 'APPROVED': return 'primary';
      case 'SENT': return 'primary';
      case 'ACKNOWLEDGED': return 'primary';
      case 'PARTIALLY_RECEIVED': return 'primary';
      case 'RECEIVED': return 'primary';
      case 'CLOSED': return 'primary';
      case 'REJECTED': return 'warn';
      case 'CANCELLED': return 'warn';
      default: return 'primary';
    }
  }

  getPriorityIcon(priority: string): string {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'priority_high';
      case 'MEDIUM': return 'remove';
      case 'LOW': return 'arrow_downward';
      default: return 'remove';
    }
  }
}
