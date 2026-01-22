import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { StockTransaction, StockTransactionRequest, StockApprovalRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class StockService {
  private apiUrl = `${environment.apiUrl}/stock`;
  private approvalsUrl = `${environment.apiUrl}/stock-approvals`;

  constructor(private http: HttpClient) {}

  recordTransaction(request: StockTransactionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/transaction`, request);
  }

  getVendorApprovalRequests(vendorId: number): Observable<StockApprovalRequest[]> {
    return this.http.get<StockApprovalRequest[]>(`${this.approvalsUrl}/vendor/${vendorId}`);
  }

  getVendorPendingRequests(vendorId: number): Observable<StockApprovalRequest[]> {
    return this.http.get<StockApprovalRequest[]>(`${this.approvalsUrl}/vendor/${vendorId}/pending`);
  }

  approveStockRequest(requestId: number, remarks?: string): Observable<StockApprovalRequest> {
    return this.http.put<StockApprovalRequest>(`${this.approvalsUrl}/${requestId}/approve`, { remarks });
  }

  rejectStockRequest(requestId: number, remarks?: string): Observable<StockApprovalRequest> {
    return this.http.put<StockApprovalRequest>(`${this.approvalsUrl}/${requestId}/reject`, { remarks });
  }

  getAllTransactions(): Observable<StockTransaction[]> {
    return this.http.get<StockTransaction[]>(`${this.apiUrl}/transactions`);
  }

  getTransactionsByProduct(productId: number): Observable<StockTransaction[]> {
    return this.http.get<StockTransaction[]>(`${this.apiUrl}/transactions/${productId}`);
  }

  getRecentTransactions(limit: number = 10): Observable<StockTransaction[]> {
    return this.http.get<StockTransaction[]>(`${this.apiUrl}/transactions?limit=${limit}`);
  }
}
