import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { InventoryStats, VendorStats, AuditLog } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = `${environment.apiUrl}/analytics`;

  constructor(private http: HttpClient) { }

  getInventoryTrends(productId?: number, categoryId?: number, days = 30): Observable<any[]> {
    let params = new HttpParams().set('days', days);
    if (productId) params = params.set('productId', productId);
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<any[]>(`${this.apiUrl}/inventory-trends`, { params });
  }

  getSalesComparison(startDate1: string, endDate1: string, startDate2: string, endDate2: string): Observable<any> {
    const params = new HttpParams()
      .set('startDate1', startDate1)
      .set('endDate1', endDate1)
      .set('startDate2', startDate2)
      .set('endDate2', endDate2);
    return this.http.get<any>(`${this.apiUrl}/sales-comparison`, { params });
  }

  getTopRestockedItems(limit = 10, days = 30): Observable<any[]> {
    const params = new HttpParams().set('limit', limit).set('days', days);
    return this.http.get<any[]>(`${this.apiUrl}/top-restocked`, { params });
  }

  getCategoryDistribution(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/category-distribution`);
  }

  getStockStatusSummary(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stock-status-summary`);
  }

  getVendorPerformance(days = 30): Observable<any[]> {
    const params = new HttpParams().set('days', days);
    return this.http.get<any[]>(`${this.apiUrl}/vendor-performance`, { params });
  }

  getInventoryStats(): Observable<InventoryStats> {
    return this.http.get<InventoryStats>(`${this.apiUrl}/inventory-stats`);
  }

  getVendorStats(): Observable<VendorStats[]> {
    return this.http.get<VendorStats[]>(`${this.apiUrl}/vendor-stats`);
  }

  exportExcelReport(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export/excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportPdfReport(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      params,
      responseType: 'blob'
    });
  }

  exportSalesExcel(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export/sales-excel`, {
      params,
      responseType: 'blob'
    });
  }

  exportPurchaseOrdersPdf(startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);
    return this.http.get(`${this.apiUrl}/export/purchase-orders-pdf`, {
      params,
      responseType: 'blob'
    });
  }
}
