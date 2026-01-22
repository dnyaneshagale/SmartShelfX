import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ForecastResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ForecastService {
  private apiUrl = `${environment.apiUrl}/forecast`;

  constructor(private http: HttpClient) {}

  generateForecast(sku: string): Observable<ForecastResponse> {
    return this.http.get<ForecastResponse>(`${this.apiUrl}/${sku}`);
  }

  getForecastBySku(sku: string): Observable<ForecastResponse> {
    return this.http.get<ForecastResponse>(`${this.apiUrl}/${sku}`);
  }
}
