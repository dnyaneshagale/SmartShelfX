import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="signup-container">
      <mat-card class="signup-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>SmartShelfX - Register as Manager or Vendor</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="signupForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" required>
              @if (signupForm.get('username')?.hasError('required') && signupForm.get('username')?.touched) {
                <mat-error>Username is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" required>
              @if (signupForm.get('fullName')?.hasError('required') && signupForm.get('fullName')?.touched) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              @if (signupForm.get('email')?.hasError('required') && signupForm.get('email')?.touched) {
                <mat-error>Email is required</mat-error>
              }
              @if (signupForm.get('email')?.hasError('email') && signupForm.get('email')?.touched) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              @if (signupForm.get('password')?.hasError('required') && signupForm.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (signupForm.get('password')?.hasError('minlength') && signupForm.get('password')?.touched) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option value="MANAGER">Warehouse Manager</mat-option>
                <mat-option value="VENDOR">Vendor</mat-option>
              </mat-select>
              @if (signupForm.get('role')?.hasError('required') && signupForm.get('role')?.touched) {
                <mat-error>Please select a role</mat-error>
              }
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" class="full-width" [disabled]="!signupForm.valid || loading">
              {{ loading ? 'Creating Account...' : 'Create Account' }}
            </button>

            <div class="login-link">
              <p>Already have an account? <a routerLink="/login">Login here</a></p>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .signup-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px 0;
    }

    .signup-card {
      width: 450px;
      max-width: 90%;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    mat-card-header {
      text-align: center;
      margin-bottom: 20px;
    }

    mat-card-title {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
    }

    .login-link {
      margin-top: 15px;
      text-align: center;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      username: ['', Validators.required],
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.signupForm.valid) {
      this.loading = true;
      this.authService.signup(this.signupForm.value).subscribe({
        next: (response) => {
          this.loading = false;
          
          // Show special message if it's a manager approval request
          if (response.message) {
            this.snackBar.open(response.message, 'Close', { duration: 5000 });
          } else {
            this.snackBar.open('Account created successfully!', 'Close', { duration: 3000 });
          }
          
          // Navigate based on role
          const role = response.role.toUpperCase();
          if (role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else if (role === 'MANAGER') {
            this.router.navigate(['/warehouse/dashboard']);
          } else if (role === 'VENDOR') {
            this.router.navigate(['/vendor/dashboard']);
          }
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.message || 'Registration failed. Please try again.';
          this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
        }
      });
    }
  }
}
