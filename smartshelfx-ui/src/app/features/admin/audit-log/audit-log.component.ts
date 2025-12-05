import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../core/services/audit-log.service';
import { AuditLog, Page } from '../../../core/models';

@Component({
    selector: 'app-audit-log',
    standalone: true,
    imports: [
        CommonModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatButtonModule,
        MatIconModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatChipsModule,
        MatProgressSpinnerModule,
        MatDatepickerModule,
        MatNativeDateModule,
        FormsModule
    ],
    templateUrl: './audit-log.component.html',
    styleUrl: './audit-log.component.scss'
})
export class AuditLogComponent implements OnInit {
    displayedColumns = ['timestamp', 'username', 'action', 'entityType', 'entityId', 'details'];
    dataSource = new MatTableDataSource<AuditLog>();
    isLoading = true;
    selectedAction: string | null = null;
    searchTerm = '';
    totalElements = 0;
    pageSize = 20;
    currentPage = 0;

    actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'STOCK_IN', 'STOCK_OUT', 'APPROVE', 'REJECT'];

    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    constructor(private auditLogService: AuditLogService) { }

    ngOnInit(): void {
        this.loadAuditLogs();
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
    }

    loadAuditLogs(): void {
        this.isLoading = true;
        this.auditLogService.getAuditLogs(this.currentPage, this.pageSize, undefined, this.selectedAction || undefined).subscribe({
            next: (page: Page<AuditLog>) => {
                this.dataSource.data = page.content;
                this.totalElements = page.totalElements;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    onPageChange(event: PageEvent): void {
        this.currentPage = event.pageIndex;
        this.pageSize = event.pageSize;
        this.loadAuditLogs();
    }

    filterByAction(): void {
        this.currentPage = 0;
        this.loadAuditLogs();
    }

    applySearch(): void {
        this.dataSource.filter = this.searchTerm.trim().toLowerCase();
    }

    clearFilters(): void {
        this.selectedAction = null;
        this.searchTerm = '';
        this.dataSource.filter = '';
        this.currentPage = 0;
        this.loadAuditLogs();
    }

    getActionColor(action: string): string {
        switch (action) {
            case 'CREATE':
            case 'STOCK_IN':
            case 'APPROVE':
                return 'primary';
            case 'DELETE':
            case 'STOCK_OUT':
            case 'REJECT':
                return 'warn';
            case 'UPDATE':
                return 'accent';
            default:
                return 'primary';
        }
    }

    getActionIcon(action: string): string {
        switch (action) {
            case 'CREATE': return 'add_circle';
            case 'UPDATE': return 'edit';
            case 'DELETE': return 'delete';
            case 'LOGIN': return 'login';
            case 'LOGOUT': return 'logout';
            case 'STOCK_IN': return 'add_shopping_cart';
            case 'STOCK_OUT': return 'remove_shopping_cart';
            case 'APPROVE': return 'check_circle';
            case 'REJECT': return 'cancel';
            default: return 'info';
        }
    }
}
