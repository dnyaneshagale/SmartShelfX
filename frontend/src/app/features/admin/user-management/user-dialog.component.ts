import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../../models/models';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.user ? 'Edit User' : 'Add New User' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="userForm" class="user-form">
        <mat-form-field appearance="outline">
          <mat-label>Username</mat-label>
          <input matInput formControlName="username" required>
          <mat-error *ngIf="userForm.get('username')?.hasError('required')">
            Username is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Full Name</mat-label>
          <input matInput formControlName="fullName" required>
          <mat-error *ngIf="userForm.get('fullName')?.hasError('required')">
            Full name is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" required>
          <mat-error *ngIf="userForm.get('email')?.hasError('required')">
            Email is required
          </mat-error>
          <mat-error *ngIf="userForm.get('email')?.hasError('email')">
            Please enter a valid email
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role" required>
            <mat-option value="ADMIN">Admin</mat-option>
            <mat-option value="MANAGER">Manager</mat-option>
            <mat-option value="VENDOR">Vendor</mat-option>
          </mat-select>
          <mat-error *ngIf="userForm.get('role')?.hasError('required')">
            Role is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" *ngIf="!data.user">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" required>
          <mat-error *ngIf="userForm.get('password')?.hasError('required')">
            Password is required
          </mat-error>
          <mat-error *ngIf="userForm.get('password')?.hasError('minlength')">
            Password must be at least 6 characters
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!userForm.valid" 
              (click)="onSave()">
        {{ data.user ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .user-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
      padding: 20px 0;
    }

    mat-form-field {
      width: 100%;
    }
  `]
})
export class UserDialogComponent {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<UserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user?: User }
  ) {
    const validators = data.user 
      ? [] 
      : [Validators.required, Validators.minLength(6)];

    this.userForm = this.fb.group({
      username: [data.user?.username || '', Validators.required],
      fullName: [data.user?.fullName || '', Validators.required],
      email: [data.user?.email || '', [Validators.required, Validators.email]],
      role: [data.user?.role || '', Validators.required],
      password: ['', validators]
    });

    // Disable username for existing users (to avoid conflicts)
    if (data.user) {
      this.userForm.get('username')?.disable();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.userForm.valid) {
      const formValue = this.userForm.value;
      
      // For edit mode, preserve the username even if disabled
      if (this.data.user) {
        formValue.username = this.data.user.username;
      }
      
      this.dialogRef.close(formValue);
    }
  }
}
