import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User, Role } from '../../../core/models';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatFormFieldModule, MatInputModule, MatCardModule,
    MatChipsModule, MatMenuModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatSlideToggleModule, MatTooltipModule, FormsModule
  ],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  displayedColumns = ['username', 'email', 'role', 'enabled', 'actions'];
  dataSource = new MatTableDataSource<User>();
  roles: Role[] = ['ADMIN', 'WAREHOUSEMANAGER', 'VENDOR'];
  isLoading = true;
  searchTerm = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers(): void {
    this.isLoading = true;
    this.authService.getUsers().subscribe({
      next: (users: User[]) => {
        this.dataSource.data = users;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.snackBar.open('Failed to load users', 'Close', { duration: 3000 });
      }
    });
  }

  applyFilter(): void {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  updateRole(user: User, newRole: Role): void {
    if (user.role === newRole) return;

    this.authService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser: User) => {
        const index = this.dataSource.data.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedUser;
          this.dataSource._updateChangeSubscription();
        }
        this.snackBar.open(`Role updated to ${newRole}`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update role', 'Close', { duration: 3000 });
      }
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = !user.enabled;
    this.authService.updateUserStatus(user.id, newStatus).subscribe({
      next: (updatedUser: User) => {
        const index = this.dataSource.data.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.dataSource.data[index] = updatedUser;
          this.dataSource._updateChangeSubscription();
        }
        this.snackBar.open(`User ${newStatus ? 'enabled' : 'disabled'}`, 'Close', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
      }
    });
  }

  getRoleColor(role: Role): string {
    switch (role) {
      case 'ADMIN': return 'warn';
      case 'WAREHOUSEMANAGER': return 'primary';
      case 'VENDOR': return 'accent';
      default: return 'primary';
    }
  }

  getRoleDisplayName(role: Role): string {
    switch (role) {
      case 'ADMIN': return 'Administrator';
      case 'WAREHOUSEMANAGER': return 'Warehouse Manager';
      case 'VENDOR': return 'Vendor';
      default: return role;
    }
  }
}
