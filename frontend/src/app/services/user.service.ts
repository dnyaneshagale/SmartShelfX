import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/role/${role}`);
  }

  getVendors(): Observable<User[]> {
    return this.getUsersByRole('VENDOR');
  }

  updateUser(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  toggleUserStatus(id: number): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  resetPassword(id: number, newPassword: string): Observable<{message: string}> {
    return this.http.put<{message: string}>(`${this.apiUrl}/${id}/reset-password`, { newPassword });
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
