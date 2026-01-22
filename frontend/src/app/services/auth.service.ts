import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, LoginResponse, SignupRequest } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response);
      })
    );
  }

  signup(signupData: SignupRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/signup`, signupData).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUser(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private setToken(token: string): void {
    localStorage.setItem('token', token);
    this.tokenSubject.next(token);
  }

  private setUser(user: LoginResponse): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): LoginResponse | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUser(): any {
    const user = this.getUser();
    console.log('AuthService - getUser() returned:', user);
    if (!user) {
      console.warn('AuthService - No user in localStorage');
      return null;
    }
    const currentUser = {
      id: user.userId,
      username: user.username,
      fullName: user.fullName,
      role: user.role
    };
    console.log('AuthService - getCurrentUser() returning:', currentUser);
    return currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUserRole(): string | null {
    const user = this.getUser();
    return user ? user.role : null;
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }
}
