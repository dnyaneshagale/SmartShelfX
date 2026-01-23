import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <mat-toolbar [class]="'toolbar-' + userRole.toLowerCase()">
      <span class="logo">SmartShelfX</span>
      <span class="role-label">{{getRoleLabel()}}</span>
      
      <nav class="nav-links">
        @if (isAdmin) {
          <!-- Admin Navigation -->
          <a mat-button routerLink="/admin/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/admin/users" routerLinkActive="active">
            <mat-icon>people</mat-icon>
            Users
          </a>
          <a mat-button routerLink="/admin/products" routerLinkActive="active">
            <mat-icon>inventory</mat-icon>
            Products
          </a>
          <a mat-button routerLink="/admin/vendors" routerLinkActive="active">
            <mat-icon>store</mat-icon>
            Vendors
          </a>
          <a mat-button routerLink="/admin/purchase-orders" routerLinkActive="active">
            <mat-icon>receipt</mat-icon>
            Orders
          </a>
          <a mat-button routerLink="/admin/forecast" routerLinkActive="active">
            <mat-icon>analytics</mat-icon>
            Forecast
          </a>
          <a mat-button routerLink="/admin/approvals" routerLinkActive="active">
            <mat-icon>how_to_reg</mat-icon>
            Approvals
          </a>
        }
        
        @if (isWarehouseManager) {
          <!-- Warehouse Manager Navigation -->
          <a mat-button routerLink="/warehouse/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/warehouse/inventory" routerLinkActive="active">
            <mat-icon>inventory</mat-icon>
            Inventory
          </a>
          <a mat-button routerLink="/warehouse/stock" routerLinkActive="active">
            <mat-icon>swap_horiz</mat-icon>
            Stock Update
          </a>
          <a mat-button routerLink="/warehouse/reorder" routerLinkActive="active">
            <mat-icon>notification_important</mat-icon>
            Reorder
          </a>
          <a mat-button routerLink="/warehouse/purchase-orders" routerLinkActive="active">
            <mat-icon>receipt</mat-icon>
            Orders
          </a>
          <a mat-button routerLink="/warehouse/forecast" routerLinkActive="active">
            <mat-icon>analytics</mat-icon>
            Forecast
          </a>
        }
        
        @if (isVendor) {
          <!-- Vendor Navigation -->
          <a mat-button routerLink="/vendor/dashboard" routerLinkActive="active">
            <mat-icon>dashboard</mat-icon>
            Dashboard
          </a>
          <a mat-button routerLink="/vendor/products" routerLinkActive="active">
            <mat-icon>inventory</mat-icon>
            My Products
          </a>
          <a mat-button routerLink="/vendor/purchase-orders" routerLinkActive="active">
            <mat-icon>receipt</mat-icon>
            Purchase Orders
          </a>
          <a mat-button routerLink="/vendor/forecast" routerLinkActive="active">
            <mat-icon>analytics</mat-icon>
            Forecast
          </a>
        }
      </nav>

      <span class="spacer"></span>

      <div class="user-info">
        <span class="role-badge">{{userRole}}</span>
        <button mat-button [matMenuTriggerFor]="menu" class="user-button">
          <mat-icon>account_circle</mat-icon>
          <span class="user-name">{{currentUser}}</span>
        </button>
      </div>
      
      <mat-menu #menu="matMenu">
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          Logout
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  styles: [`
    mat-toolbar {
      display: flex;
      align-items: center;
      transition: background 0.3s ease;
    }

    /* Role-specific toolbar colors */
    .toolbar-admin {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .toolbar-manager,
    .toolbar-warehouse_manager {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .toolbar-vendor {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    }

    .logo {
      font-size: 20px;
      font-weight: bold;
      margin-right: 15px;
    }

    .role-label {
      font-size: 12px;
      opacity: 0.8;
      margin-right: 30px;
      padding-left: 15px;
      border-left: 1px solid rgba(255, 255, 255, 0.3);
    }

    .nav-links {
      display: flex;
      gap: 5px;
    }

    .nav-links a {
      color: white;
      display: flex;
      align-items: center;
      gap: 5px;
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .nav-links a mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .nav-links a:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .nav-links a.active {
      background: rgba(255, 255, 255, 0.25);
      font-weight: 600;
    }

    .spacer {
      flex: 1 1 auto;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      color: white;
    }

    .user-info .user-button {
      color: white;
      background: rgba(255, 255, 255, 0.15);
      padding: 6px 12px;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .user-info .user-button:hover {
      background: rgba(255, 255, 255, 0.25);
    }

    .user-info .user-button .user-name {
      color: white;
      font-weight: 500;
      margin-left: 6px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    .user-info .user-button mat-icon {
      color: white;
    }

    .role-badge {
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: white;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 960px) {
      .nav-links a span {
        display: none;
      }
      
      .role-label {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  currentUser: string;
  userRole: string;
  isWarehouseManager: boolean;
  isVendor: boolean;
  isAdmin: boolean;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const user = this.authService.getUser();
    this.currentUser = user?.fullName || user?.username || 'User';
    this.userRole = user?.role || 'USER';
    this.isWarehouseManager = this.userRole === 'MANAGER' || this.userRole === 'WAREHOUSE_MANAGER';
    this.isVendor = this.userRole === 'VENDOR';
    this.isAdmin = this.userRole === 'ADMIN';
  }

  getRoleLabel(): string {
    switch (this.userRole) {
      case 'ADMIN':
        return 'Admin Portal';
      case 'MANAGER':
      case 'WAREHOUSE_MANAGER':
        return 'Warehouse Manager Portal';
      case 'VENDOR':
        return 'Vendor Portal';
      default:
        return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
