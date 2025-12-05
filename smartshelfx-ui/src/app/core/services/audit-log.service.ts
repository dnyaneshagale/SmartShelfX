import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuditLog, Page } from '../models';

@Injectable({
    providedIn: 'root'
})
export class AuditLogService {
    private apiUrl = `${environment.apiUrl}/admin/audit-logs`;

    constructor(private http: HttpClient) { }

    getAuditLogs(page = 0, size = 50, entityType?: string, action?: string, userId?: number): Observable<Page<AuditLog>> {
        let params = new HttpParams().set('page', page).set('size', size);
        if (entityType) params = params.set('entityType', entityType);
        if (action) params = params.set('auditAction', action);
        if (userId) params = params.set('userId', userId);
        return this.http.get<Page<AuditLog>>(this.apiUrl, { params });
    }

    getRecentAuditLogs(): Observable<AuditLog[]> {
        return this.http.get<AuditLog[]>(`${this.apiUrl}/recent`);
    }

    getAuditLogsByEntity(entityType: string, entityId: number, page = 0, size = 20): Observable<Page<AuditLog>> {
        const params = new HttpParams().set('page', page).set('size', size);
        return this.http.get<Page<AuditLog>>(`${this.apiUrl}/${entityType}/${entityId}`, { params });
    }

    getAuditLogsByAction(action: string): Observable<AuditLog[]> {
        const params = new HttpParams().set('auditAction', action);
        return this.http.get<Page<AuditLog>>(this.apiUrl, { params }).pipe(
            map((page: Page<AuditLog>) => page.content)
        );
    }

    getAuditLogsByUser(userId: number): Observable<AuditLog[]> {
        const params = new HttpParams().set('userId', userId);
        return this.http.get<Page<AuditLog>>(this.apiUrl, { params }).pipe(
            map((page: Page<AuditLog>) => page.content)
        );
    }
}
