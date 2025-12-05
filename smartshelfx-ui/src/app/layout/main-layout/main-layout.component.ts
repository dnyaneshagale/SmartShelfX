import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatBadgeModule, MatMenuModule, MatTooltipModule, MatChipsModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  currentUser: User | null = null;
  notificationCount = 0;
  isExpanded = true;

  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Inventory', icon: 'inventory_2', route: '/inventory' },
    { label: 'Transactions', icon: 'swap_horiz', route: '/transactions', roles: ['ADMIN', 'WAREHOUSEMANAGER'] },
    { label: 'Forecasting', icon: 'trending_up', route: '/forecasting' },
    { label: 'Purchase Orders', icon: 'shopping_cart', route: '/purchase-orders' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Analytics', icon: 'analytics', route: '/analytics', roles: ['ADMIN', 'WAREHOUSEMANAGER'] },
    { label: 'User Management', icon: 'people', route: '/admin/users', roles: ['ADMIN'] },
    { label: 'Audit Logs', icon: 'history', route: '/admin/audit-logs', roles: ['ADMIN'] }
  ];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    this.loadNotificationCount();
  }

  loadNotificationCount(): void {
    this.notificationService.getUnreadCount().subscribe({
      next: (count: number) => this.notificationCount = count,
      error: () => this.notificationCount = 0
    });
  }

  toggleSidenav(): void {
    this.isExpanded = !this.isExpanded;
  }

  getFilteredNavItems(): NavItem[] {
    return this.navItems.filter(item => {
      if (!item.roles) return true;
      return this.currentUser && item.roles.includes(this.currentUser.role);
    });
  }

  getUserInitials(): string {
    if (this.currentUser?.name) {
      return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return this.currentUser?.username?.substring(0, 2).toUpperCase() || 'U';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/auth/login';
  }
}
