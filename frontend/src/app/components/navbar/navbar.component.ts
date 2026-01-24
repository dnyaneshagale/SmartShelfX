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
      
      <!-- Mobile Menu Button -->
      <button mat-icon-button class="mobile-menu-button" (click)="toggleMobileMenu()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <nav class="nav-links" [class.mobile-menu-open]="mobileMenuOpen">
        @if (isAdmin) {
          <!-- Admin Navigation -->
          <a mat-button routerLink="/admin/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-button routerLink="/admin/users" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>people</mat-icon>
            <span>Users</span>
          </a>
          <a mat-button routerLink="/admin/products" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>inventory</mat-icon>
            <span>Products</span>
          </a>
          <a mat-button routerLink="/admin/vendors" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>store</mat-icon>
            <span>Vendors</span>
          </a>
          <a mat-button routerLink="/admin/purchase-orders" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>receipt</mat-icon>
            <span>Orders</span>
          </a>
          <a mat-button routerLink="/admin/forecast" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>analytics</mat-icon>
            <span>Forecast</span>
          </a>
          <a mat-button routerLink="/admin/approvals" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>how_to_reg</mat-icon>
            <span>Approvals</span>
          </a>
        }
        
        @if (isWarehouseManager) {
          <!-- Warehouse Manager Navigation -->
          <a mat-button routerLink="/warehouse/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-button routerLink="/warehouse/inventory" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>inventory</mat-icon>
            <span>Inventory</span>
          </a>
          <a mat-button routerLink="/warehouse/stock" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>swap_horiz</mat-icon>
            <span>Stock Update</span>
          </a>
          <a mat-button routerLink="/warehouse/reorder" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>notification_important</mat-icon>
            <span>Reorder</span>
          </a>
          <a mat-button routerLink="/warehouse/purchase-orders" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>receipt</mat-icon>
            <span>Orders</span>
          </a>
          <a mat-button routerLink="/warehouse/forecast" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>analytics</mat-icon>
            <span>Forecast</span>
          </a>
        }
        
        @if (isVendor) {
          <!-- Vendor Navigation -->
          <a mat-button routerLink="/vendor/dashboard" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>dashboard</mat-icon>
            <span>Dashboard</span>
          </a>
          <a mat-button routerLink="/vendor/products" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>inventory</mat-icon>
            <span>My Products</span>
          </a>
          <a mat-button routerLink="/vendor/purchase-orders" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>receipt</mat-icon>
            <span>Purchase Orders</span>
          </a>
          <a mat-button routerLink="/vendor/forecast" routerLinkActive="active" (click)="closeMobileMenu()">
            <mat-icon>analytics</mat-icon>
            <span>Forecast</span>
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

    .mobile-menu-button {
      display: none;
      color: white;
      margin-right: 8px;
      transition: transform 0.3s ease;
    }

    .mobile-menu-button:active {
      transform: scale(0.95);
    }

    /* Mobile Responsive Styles */
    @media (max-width: 960px) {
      mat-toolbar {
        padding: 0 8px;
      }

      .nav-links {
        display: none;
        position: fixed;
        top: 64px;
        left: 0;
        right: 0;
        background: inherit;
        flex-direction: column;
        padding: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: calc(100vh - 64px);
        overflow-y: auto;
        animation: slideDown 0.3s ease-out;
      }

      .nav-links.mobile-menu-open {
        display: flex;
      }

      @keyframes slideDown {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .nav-links a {
        width: 100%;
        justify-content: flex-start;
        padding: 12px 16px;
        margin: 2px 0;
        border-radius: 8px;
      }

      .nav-links a:active {
        transform: scale(0.98);
      }

      .nav-links a span {
        display: inline;
      }

      .mobile-menu-button {
        display: block;
        margin-left: auto;
        margin-right: 12px;
      }
      
      .role-label {
        display: none;
      }

      .spacer {
        display: none;
      }

      .user-info {
        gap: 8px;
      }

      .user-info .user-button {
        padding: 4px 8px;
        min-width: 40px;
      }

      .user-info .user-name {
        display: none;
      }

      .role-badge {
        display: none;
      }
    }

    @media (max-width: 600px) {
      .logo {
        font-size: 16px;
        margin-right: 8px;
      }

      .mobile-menu-button {
        margin-right: 8px;
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
  mobileMenuOpen = false;

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

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
