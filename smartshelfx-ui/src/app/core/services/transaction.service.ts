import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StockMovement, StockInRequest, StockOutRequest, StockUpdateRequest, MovementType, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) { }

  getMovements(page = 0, size = 20, type?: MovementType, productId?: number): Observable<Page<StockMovement>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (type) params = params.set('type', type);
    if (productId) params = params.set('productId', productId);
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/movements`, { params });
  }

  // Get all movements with optional filters - returns Page (server-side pagination)
  getAllMovements(page = 0, size = 100): Observable<Page<StockMovement>> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/movements`, { params });
  }

  getMovementsByProduct(productId: number, page = 0, size = 100): Observable<Page<StockMovement>> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/movements`, { params });
  }

  getMovementsByType(type: MovementType, page = 0, size = 100): Observable<Page<StockMovement>> {
    const params = new HttpParams()
      .set('type', type)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<StockMovement>>(`${this.apiUrl}/movements`, { params });
  }

  getMovementsByDateRange(startDate: string, endDate: string): Observable<StockMovement[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<StockMovement[]>(`${this.apiUrl}/movements/date-range`, { params });
  }

  stockIn(request: StockInRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock-in`, request);
  }

  batchStockIn(requests: StockInRequest[]): Observable<StockMovement[]> {
    return this.http.post<StockMovement[]>(`${this.apiUrl}/stock-in/batch`, requests);
  }

  stockOut(request: StockOutRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock-out`, request);
  }

  batchStockOut(requests: StockOutRequest[]): Observable<StockMovement[]> {
    return this.http.post<StockMovement[]>(`${this.apiUrl}/stock-out/batch`, requests);
  }

  adjustStock(request: StockUpdateRequest): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/adjust`, request);
  }

  getRecentMovements(limit = 10): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(`${this.apiUrl}/movements/recent`, { params: { limit } });
  }

  getSalesData(startDate: string, endDate: string): Observable<any[]> {
    const params = new HttpParams().set('startDate', startDate).set('endDate', endDate);
    return this.http.get<any[]>(`${this.apiUrl}/sales`, { params });
  }
}
