import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DemandForecast, ForecastRequest, Page } from '../models';

@Injectable({ providedIn: 'root' })
export class ForecastService {
  private apiUrl = `${environment.apiUrl}/forecast`;

  constructor(private http: HttpClient) { }

  // Get forecasts - using at-risk products as main list
  getAllForecasts(): Observable<DemandForecast[]> {
    return this.http.get<DemandForecast[]>(`${this.apiUrl}/at-risk`);
  }

  // Get latest forecast for a specific product
  getForecast(productId: number): Observable<DemandForecast> {
    return this.http.get<DemandForecast>(`${this.apiUrl}/latest/${productId}`);
  }

  getForecastHistory(productId: number, page = 0, size = 20): Observable<Page<DemandForecast>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<DemandForecast>>(`${this.apiUrl}/history/${productId}`, { params });
  }

  generateForecast(request: ForecastRequest): Observable<DemandForecast> {
    return this.http.post<DemandForecast>(`${this.apiUrl}/generate`, request);
  }

  generateAllForecasts(period = 'DAILY', horizon = 14): Observable<DemandForecast[]> {
    const params = new HttpParams()
      .set('period', period)
      .set('horizon', horizon.toString());
    return this.http.post<DemandForecast[]>(`${this.apiUrl}/generate-all`, {}, { params });
  }

  getProductsAtRisk(): Observable<DemandForecast[]> {
    return this.http.get<DemandForecast[]>(`${this.apiUrl}/at-risk`);
  }

  getVendorProductsAtRisk(): Observable<DemandForecast[]> {
    return this.http.get<DemandForecast[]>(`${this.apiUrl}/vendor/at-risk`);
  }
}
