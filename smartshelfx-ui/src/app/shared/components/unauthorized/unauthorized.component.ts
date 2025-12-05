import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-unauthorized',
    standalone: true,
    imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule],
    template: `
    <div class="unauthorized-container">
      <mat-card class="unauthorized-card">
        <mat-card-content>
          <mat-icon class="lock-icon">lock</mat-icon>
          <h1>Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <p class="subtitle">Please contact your administrator if you believe this is an error.</p>
          <div class="actions">
            <button mat-raised-button color="primary" routerLink="/dashboard">
              <mat-icon>home</mat-icon>
              Go to Dashboard
            </button>
            <button mat-stroked-button routerLink="/auth/login">
              <mat-icon>login</mat-icon>
              Login as Different User
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
    styles: [`
    .unauthorized-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .unauthorized-card {
      text-align: center;
      padding: 3rem;
      max-width: 450px;

      .lock-icon {
        font-size: 5rem;
        width: 5rem;
        height: 5rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      h1 {
        margin: 0 0 0.5rem;
        color: #1e293b;
      }

      p {
        color: #64748b;
        margin: 0 0 0.5rem;
      }

      .subtitle {
        font-size: 0.875rem;
        margin-bottom: 2rem;
      }

      .actions {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }
      }
    }
  `]
})
export class UnauthorizedComponent { }
