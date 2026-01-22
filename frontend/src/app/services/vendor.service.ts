import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VendorService {
  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  assignVendor(productId: number, vendorId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/products/${productId}/vendor/${vendorId}`, {});
  }

  removeVendor(productId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/products/${productId}/vendor`);
  }

  getAllVendors(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users/role/VENDOR`);
  }
}
