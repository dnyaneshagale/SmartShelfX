import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ManagerApprovalRequest {
  id: number;
  userId: number;
  username: string;
  email: string;
  fullName: string;
  requestedAt: string;
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  remarks?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ManagerApprovalService {
  private apiUrl = `${environment.apiUrl}/admin/approval-requests`;

  constructor(private http: HttpClient) {}

  getPendingRequests(): Observable<ManagerApprovalRequest[]> {
    return this.http.get<ManagerApprovalRequest[]>(this.apiUrl);
  }

  getAllRequests(): Observable<ManagerApprovalRequest[]> {
    return this.http.get<ManagerApprovalRequest[]>(`${this.apiUrl}/all`);
  }

  approveRequest(id: number, remarks: string = 'Approved'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/approve`, { remarks });
  }

  rejectRequest(id: number, remarks: string = 'Rejected'): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/reject`, { remarks });
  }
}
