import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, ProductCreateRequest, ProductUpdateRequest, ProductFilter, Category, Page, StockStatus, DashboardResponse } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private adminUrl = `${environment.apiUrl}/admin`;
  private warehouseUrl = `${environment.apiUrl}/warehouse`;
  private dashboardUrl = `${environment.apiUrl}/dashboard`;

  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private getBaseUrl(): string {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN' ? this.adminUrl : this.warehouseUrl;
  }

  private isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  getAllProducts(page = 0, size = 20, filter?: ProductFilter): Observable<Page<Product>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (filter?.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter?.stockStatus) params = params.set('stockStatus', filter.stockStatus);
    if (filter?.searchTerm) params = params.set('search', filter.searchTerm);
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params });
  }

  // Returns products array (extracts content from Page)
  getProducts(page = 0, size = 100): Observable<Product[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params })
      .pipe(map(p => p.content));
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.getBaseUrl()}/products/${id}`);
  }

  createProduct(product: ProductCreateRequest): Observable<Product> {
    return this.http.post<Product>(`${this.getBaseUrl()}/products`, product);
  }

  updateProduct(id: number, product: ProductUpdateRequest): Observable<Product> {
    return this.http.put<Product>(`${this.getBaseUrl()}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    // Only admin can delete
    return this.http.delete<void>(`${this.adminUrl}/products/${id}`);
  }

  filterProducts(filter: ProductFilter): Observable<Product[]> {
    let params = new HttpParams()
      .set('page', '0')
      .set('size', '100');
    if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    if (filter.stockStatus) params = params.set('stockStatus', filter.stockStatus);
    if (filter.searchTerm) params = params.set('search', filter.searchTerm);
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params })
      .pipe(map(p => p.content));
  }

  getLowStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.getBaseUrl()}/products/low-stock`);
  }

  getOutOfStockProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.getBaseUrl()}/products/out-of-stock`);
  }

  getProductsByCategory(categoryId: number): Observable<Product[]> {
    const params = new HttpParams()
      .set('categoryId', categoryId.toString())
      .set('page', '0')
      .set('size', '100');
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params })
      .pipe(map(p => p.content));
  }

  getProductsByStatus(status: StockStatus): Observable<Product[]> {
    const params = new HttpParams()
      .set('stockStatus', status)
      .set('page', '0')
      .set('size', '100');
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params })
      .pipe(map(p => p.content));
  }

  searchProducts(term: string): Observable<Product[]> {
    const params = new HttpParams()
      .set('search', term)
      .set('page', '0')
      .set('size', '50');
    return this.http.get<Page<Product>>(`${this.getBaseUrl()}/products`, { params })
      .pipe(map(p => p.content));
  }

  exportCsv(): Observable<Blob> {
    return this.http.get(`${this.getBaseUrl()}/products/export`, { responseType: 'blob' });
  }

  importCsv(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.adminUrl}/products/import`, formData);
  }

  getCsvTemplate(): Observable<Blob> {
    return this.http.get(`${this.adminUrl}/products/template`, { responseType: 'blob' });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.getBaseUrl()}/categories`);
  }

  createCategory(name: string, description?: string): Observable<Category> {
    let params = new HttpParams().set('name', name);
    if (description) params = params.set('description', description);
    return this.http.post<Category>(`${this.adminUrl}/categories`, null, { params });
  }

  updateCategory(id: number, name?: string, description?: string): Observable<Category> {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (description) params = params.set('description', description);
    return this.http.put<Category>(`${this.adminUrl}/categories/${id}`, null, { params });
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/categories/${id}`);
  }

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(this.dashboardUrl);
  }

  getInventoryStats(): Observable<any> {
    return this.http.get<any>(`${this.adminUrl}/inventory/stats`);
  }
}
