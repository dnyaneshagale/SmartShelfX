import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Notification, NotificationType, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) { }

  getNotifications(page = 0, size = 20): Observable<Page<Notification>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<Notification>>(this.apiUrl, { params });
  }

  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Page<Notification>>(this.apiUrl).pipe(
      map(page => page.content)
    );
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/count`).pipe(
      map(response => response.count)
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getNotificationsByType(type: NotificationType): Observable<Notification[]> {
    const params = new HttpParams().set('type', type);
    return this.http.get<Notification[]>(`${this.apiUrl}/type/${type}`);
  }
}
