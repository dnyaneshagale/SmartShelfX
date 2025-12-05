import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatIconModule, MatButtonModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule],
  templateUrl: './notification-list.component.html',
  styleUrl: './notification-list.component.scss'
})
export class NotificationListComponent implements OnInit {
  notifications: Notification[] = [];
  isLoading = true;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getAllNotifications().subscribe({
      next: (notifications: Notification[]) => { this.notifications = notifications; this.isLoading = false; },
      error: () => this.isLoading = false
    });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => notification.read = true
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => this.notifications.forEach(n => n.read = true)
    });
  }

  deleteNotification(notification: Notification): void {
    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => this.notifications = this.notifications.filter(n => n.id !== notification.id)
    });
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'warning';
      case 'OUT_OF_STOCK': return 'error';
      case 'REORDER_APPROVED': return 'check_circle';
      case 'REORDER_REJECTED': return 'cancel';
      case 'STOCK_RECEIVED': return 'local_shipping';
      default: return 'notifications';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case 'LOW_STOCK': return 'warn';
      case 'OUT_OF_STOCK': return 'accent';
      case 'REORDER_APPROVED': return 'primary';
      case 'REORDER_REJECTED': return 'warn';
      default: return 'primary';
    }
  }
}
