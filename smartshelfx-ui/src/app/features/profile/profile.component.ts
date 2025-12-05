import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule,
        MatProgressSpinnerModule,
        MatDividerModule
    ],
    template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <div class="avatar">{{ getUserInitials() }}</div>
          <mat-card-title>{{ currentUser?.username }}</mat-card-title>
          <mat-card-subtitle>
            <mat-chip [color]="getRoleColor()">{{ currentUser?.role }}</mat-chip>
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="profile-info">
            <div class="info-row">
              <mat-icon>person</mat-icon>
              <div class="info-content">
                <label>Username</label>
                <span>{{ currentUser?.username }}</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>email</mat-icon>
              <div class="info-content">
                <label>Email</label>
                <span>{{ currentUser?.email }}</span>
              </div>
            </div>
            <div class="info-row">
              <mat-icon>badge</mat-icon>
              <div class="info-content">
                <label>Role</label>
                <span>{{ getRoleDisplayName() }}</span>
              </div>
            </div>
          </div>

          <mat-divider></mat-divider>

          <h3>Change Password</h3>
          <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Current Password</mat-label>
              <input matInput type="password" formControlName="currentPassword">
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>New Password</mat-label>
              <input matInput type="password" formControlName="newPassword">
              <mat-icon matSuffix>lock_outline</mat-icon>
              <mat-hint>Minimum 6 characters</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirm New Password</mat-label>
              <input matInput type="password" formControlName="confirmPassword">
              <mat-icon matSuffix>lock_outline</mat-icon>
              <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('mismatch')">
                Passwords do not match
              </mat-error>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!passwordForm.valid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="20"></mat-spinner>
              <span *ngIf="!isLoading">Update Password</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .profile-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .profile-card {
      mat-card-header {
        display: flex;
        align-items: center;
        margin-bottom: 24px;

        .avatar {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 500;
          margin-right: 16px;
        }
      }
    }

    .profile-info {
      margin: 24px 0;

      .info-row {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #eee;

        mat-icon {
          color: #666;
          margin-right: 16px;
        }

        .info-content {
          display: flex;
          flex-direction: column;

          label {
            font-size: 12px;
            color: #666;
          }

          span {
            font-size: 16px;
            font-weight: 500;
          }
        }
      }
    }

    mat-divider {
      margin: 24px 0;
    }

    h3 {
      margin-bottom: 16px;
      color: #333;
    }

    .full-width {
      width: 100%;
      margin-bottom: 8px;
    }

    button[type="submit"] {
      margin-top: 16px;
    }
  `]
})
export class ProfileComponent implements OnInit {
    currentUser: User | null = null;
    passwordForm!: FormGroup;
    isLoading = false;

    constructor(
        private authService: AuthService,
        private fb: FormBuilder,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.initForm();
    }

    initForm(): void {
        this.passwordForm = this.fb.group({
            currentPassword: ['', [Validators.required]],
            newPassword: ['', [Validators.required, Validators.minLength(6)]],
            confirmPassword: ['', [Validators.required]]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(form: FormGroup) {
        const newPassword = form.get('newPassword')?.value;
        const confirmPassword = form.get('confirmPassword')?.value;
        if (newPassword !== confirmPassword) {
            form.get('confirmPassword')?.setErrors({ mismatch: true });
        }
        return null;
    }

    getUserInitials(): string {
        if (this.currentUser?.name) {
            return this.currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }
        return this.currentUser?.username?.substring(0, 2).toUpperCase() || 'U';
    }

    getRoleDisplayName(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'Administrator';
            case 'WAREHOUSEMANAGER': return 'Warehouse Manager';
            case 'VENDOR': return 'Vendor';
            default: return this.currentUser?.role || 'User';
        }
    }

    getRoleColor(): string {
        switch (this.currentUser?.role) {
            case 'ADMIN': return 'warn';
            case 'WAREHOUSEMANAGER': return 'primary';
            case 'VENDOR': return 'accent';
            default: return 'primary';
        }
    }

    changePassword(): void {
        if (this.passwordForm.invalid) return;

        this.isLoading = true;
        // Note: Backend endpoint for password change would need to be implemented
        // For now, show a message
        setTimeout(() => {
            this.isLoading = false;
            this.snackBar.open('Password change feature requires backend implementation', 'Close', {
                duration: 3000
            });
            this.passwordForm.reset();
        }, 1000);
    }
}
