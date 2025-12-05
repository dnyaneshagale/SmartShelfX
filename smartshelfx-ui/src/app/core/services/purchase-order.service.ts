import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReorderRequest, ReorderCreateRequest, ReorderStatus, RestockSuggestion, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {
  private apiUrl = `${environment.apiUrl}/purchase-orders`;

  constructor(private http: HttpClient) { }

  // Get all purchase orders with pagination and filters
  getReorderRequests(page = 0, size = 20, status?: ReorderStatus, vendorId?: number): Observable<Page<ReorderRequest>> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (status) params = params.set('status', status);
    if (vendorId) params = params.set('vendorId', vendorId.toString());
    return this.http.get<Page<ReorderRequest>>(this.apiUrl, { params });
  }

  // Get all purchase orders (returns Page, extracts content in component)
  getAllReorderRequests(page = 0, size = 100): Observable<Page<ReorderRequest>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<ReorderRequest>>(this.apiUrl, { params });
  }

  getReorderRequest(id: number): Observable<ReorderRequest> {
    return this.http.get<ReorderRequest>(`${this.apiUrl}/${id}`);
  }

  getReorderRequestsByStatus(status: ReorderStatus, page = 0, size = 100): Observable<Page<ReorderRequest>> {
    const params = new HttpParams()
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ReorderRequest>>(this.apiUrl, { params });
  }

  getPendingReorderRequests(page = 0, size = 100): Observable<Page<ReorderRequest>> {
    const params = new HttpParams()
      .set('status', 'PENDING')
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<ReorderRequest>>(this.apiUrl, { params });
  }

  getVendorPurchaseOrders(page = 0, size = 20): Observable<Page<ReorderRequest>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<ReorderRequest>>(`${this.apiUrl}/vendor`, { params });
  }

  createReorderRequest(request: ReorderCreateRequest): Observable<ReorderRequest> {
    return this.http.post<ReorderRequest>(this.apiUrl, request);
  }

  autoGeneratePurchaseOrders(): Observable<ReorderRequest[]> {
    return this.http.post<ReorderRequest[]>(`${this.apiUrl}/auto-generate`, {});
  }

  submitForApproval(id: number): Observable<ReorderRequest> {
    return this.http.put<ReorderRequest>(`${this.apiUrl}/${id}/submit`, {});
  }

  approveReorder(id: number): Observable<ReorderRequest> {
    return this.http.put<ReorderRequest>(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectReorder(id: number, reason: string): Observable<ReorderRequest> {
    const params = new HttpParams().set('reason', reason);
    return this.http.put<ReorderRequest>(`${this.apiUrl}/${id}/reject`, {}, { params });
  }

  markAsReceived(id: number, receivedItems?: any[]): Observable<ReorderRequest> {
    return this.http.put<ReorderRequest>(`${this.apiUrl}/${id}/receive`, receivedItems || []);
  }

  cancelReorder(id: number): Observable<ReorderRequest> {
    return this.http.put<ReorderRequest>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getRestockSuggestions(): Observable<RestockSuggestion[]> {
    return this.http.get<RestockSuggestion[]>(`${this.apiUrl}/suggestions`);
  }
}
