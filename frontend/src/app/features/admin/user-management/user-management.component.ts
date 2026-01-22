import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/models';
import { UserDialogComponent } from './user-dialog.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <div class="user-management">
      <div class="header">
        <h1>User Management</h1>
        <button mat-raised-button color="primary" (click)="openUserDialog()">
          <mat-icon>person_add</mat-icon>
          Add New User
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="table-container">
            <table class="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @if (users.length === 0) {
                  <tr>
                    <td colspan="7" class="no-data">No users found</td>
                  </tr>
                }
                @for (user of users; track user.id) {
                  <tr>
                    <td>{{user.username}}</td>
                    <td>{{user.fullName}}</td>
                    <td>{{user.email}}</td>
                    <td>
                      <mat-chip [class]="'role-' + user.role.toLowerCase()">
                        {{user.role}}
                      </mat-chip>
                    </td>
                    <td>
                      <mat-chip [class]="(user.active ?? true) ? 'status-active' : 'status-inactive'">
                        {{(user.active ?? true) ? 'Active' : 'Inactive'}}
                      </mat-chip>
                    </td>
                    <td>{{user.createdAt ? (user.createdAt | date:'short') : 'N/A'}}</td>
                    <td class="actions">
                      <button mat-icon-button color="primary" (click)="editUser(user)">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn" (click)="toggleUserStatus(user)">
                        <mat-icon>{{(user.active ?? true) ? 'block' : 'check_circle'}}</mat-icon>
                      </button>
                      <button mat-icon-button (click)="resetPassword(user)">
                        <mat-icon>lock_reset</mat-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="summary">
            <div class="summary-item">
              <mat-icon>people</mat-icon>
              <span>Total Users: <strong>{{users.length}}</strong></span>
            </div>
            <div class="summary-item">
              <mat-icon>admin_panel_settings</mat-icon>
              <span>Admins: <strong>{{getUsersByRole('ADMIN').length}}</strong></span>
            </div>
            <div class="summary-item">
              <mat-icon>warehouse</mat-icon>
              <span>Managers: <strong>{{getUsersByRole('MANAGER').length}}</strong></span>
            </div>
            <div class="summary-item">
              <mat-icon>store</mat-icon>
              <span>Vendors: <strong>{{getUsersByRole('VENDOR').length}}</strong></span>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .user-management {
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

    .header button {
      height: 48px;
    }

    .table-container {
      overflow-x: auto;
      margin-bottom: 24px;
    }

    .user-table {
      width: 100%;
      border-collapse: collapse;
    }

    .user-table th {
      background: #f5f5f5;
      padding: 16px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #e0e0e0;
    }

    .user-table td {
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .user-table tbody tr:hover {
      background: #f9f9f9;
    }

    .no-data {
      text-align: center;
      color: #999;
      padding: 48px !important;
    }

    .actions {
      display: flex;
      gap: 8px;
    }

    .role-admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      color: white !important;
    }

    .role-manager {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%) !important;
      color: white !important;
    }

    .role-vendor {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
      color: white !important;
    }

    .status-active {
      background-color: #c8e6c9 !important;
      color: #2e7d32 !important;
    }

    .status-inactive {
      background-color: #ffcdd2 !important;
      color: #c62828 !important;
    }

    .summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      padding: 16px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .summary-item mat-icon {
      color: #667eea;
    }

    .summary-item span {
      font-size: 14px;
      color: #666;
    }

    .summary-item strong {
      color: #333;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      .user-table {
        font-size: 14px;
      }

      .user-table th,
      .user-table td {
        padding: 12px 8px;
      }

      .summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (error) => console.error('Error loading users:', error)
    });
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(u => u.role === role);
  }

  openUserDialog(): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Create new user via signup endpoint
        this.authService.signup(result).subscribe({
          next: () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to create user: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editUser(user: User): void {
    const dialogRef = this.dialog.open(UserDialogComponent, {
      width: '500px',
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.updateUser(user.id!, result).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (error) => {
            this.snackBar.open('Failed to update user: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  toggleUserStatus(user: User): void {
    const action = (user.active ?? true) ? 'deactivate' : 'activate';
    
    if (confirm(`Are you sure you want to ${action} ${user.username}?`)) {
      this.userService.toggleUserStatus(user.id!).subscribe({
        next: () => {
          this.snackBar.open(`User ${action}d successfully`, 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          this.snackBar.open('Failed to update user status', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetPassword(user: User): void {
    const newPassword = prompt(`Enter new password for ${user.username} (min 6 characters):`);
    
    if (newPassword) {
      if (newPassword.length < 6) {
        this.snackBar.open('Password must be at least 6 characters', 'Close', { duration: 3000 });
        return;
      }

      this.userService.resetPassword(user.id!, newPassword).subscribe({
        next: (response) => {
          this.snackBar.open(response.message, 'Close', { duration: 3000 });
        },
        error: (error) => {
          this.snackBar.open('Failed to reset password: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }
}
