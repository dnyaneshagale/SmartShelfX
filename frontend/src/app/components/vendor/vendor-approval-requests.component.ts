import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StockService } from '../../services/stock.service';
import { AuthService } from '../../services/auth.service';
import { StockApprovalRequest } from '../../models/models';

@Component({
  selector: 'app-approval-remarks-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form [formGroup]="remarksForm">
        <mat-form-field class="full-width">
          <mat-label>Remarks (Optional)</mat-label>
          <textarea matInput formControlName="remarks" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="null">Cancel</button>
      <button mat-raised-button [mat-dialog-close]="remarksForm.value.remarks" color="primary">
        {{ data.action }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
    }
  `]
})
export class ApprovalRemarksDialogComponent {
  remarksForm: FormGroup;
  data: any;

  constructor(private fb: FormBuilder) {
    this.remarksForm = this.fb.group({
      remarks: ['']
    });
    this.data = { title: '', action: '' };
  }
}

@Component({
  selector: 'app-vendor-approval-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="approval-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Stock IN Approval Requests</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="approvalRequests" class="mat-elevation-z2">
            
            <!-- Product Column -->
            <ng-container matColumnDef="product">
              <th mat-header-cell *matHeaderCellDef>Product</th>
              <td mat-cell *matCellDef="let request">{{ request.product.name }}</td>
            </ng-container>

            <!-- SKU Column -->
            <ng-container matColumnDef="sku">
              <th mat-header-cell *matHeaderCellDef>SKU</th>
              <td mat-cell *matCellDef="let request">{{ request.product.sku }}</td>
            </ng-container>

            <!-- Quantity Column -->
            <ng-container matColumnDef="quantity">
              <th mat-header-cell *matHeaderCellDef>Quantity</th>
              <td mat-cell *matCellDef="let request">{{ request.quantity }}</td>
            </ng-container>

            <!-- Requested By Column -->
            <ng-container matColumnDef="requestedBy">
              <th mat-header-cell *matHeaderCellDef>Requested By</th>
              <td mat-cell *matCellDef="let request">
                {{ request.requestedBy?.fullName || request.requestedBy?.username || '-' }}
              </td>
            </ng-container>

            <!-- Manager Remarks Column -->
            <ng-container matColumnDef="remarks">
              <th mat-header-cell *matHeaderCellDef>Manager Remarks</th>
              <td mat-cell *matCellDef="let request">{{ request.remarks || '-' }}</td>
            </ng-container>

            <!-- Created Date Column -->
            <ng-container matColumnDef="createdAt">
              <th mat-header-cell *matHeaderCellDef>Request Date</th>
              <td mat-cell *matCellDef="let request">{{ formatDate(request.createdAt) }}</td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let request">
                <span [class]="'status-' + request.status.toLowerCase()">
                  {{ request.status }}
                </span>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let request">
                <div *ngIf="request.status === 'PENDING'" class="action-buttons">
                  <button mat-raised-button color="primary" (click)="approveRequest(request)">
                    <mat-icon>check_circle</mat-icon> Approve
                  </button>
                  <button mat-raised-button color="warn" (click)="rejectRequest(request)">
                    <mat-icon>cancel</mat-icon> Reject
                  </button>
                </div>
                <span *ngIf="request.status !== 'PENDING'" class="responded-info">
                  {{ request.vendorRemarks || 'No remarks' }}
                </span>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <div *ngIf="approvalRequests.length === 0" class="no-data">
            <p>No approval requests found.</p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .approval-container {
      padding: 20px;
    }

    table {
      width: 100%;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .action-buttons button {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .status-pending {
      color: #ff9800;
      font-weight: 500;
    }

    .status-approved {
      color: #4caf50;
      font-weight: 500;
    }

    .status-rejected {
      color: #f44336;
      font-weight: 500;
    }

    .responded-info {
      font-style: italic;
      color: #666;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class VendorApprovalRequestsComponent implements OnInit {
  approvalRequests: StockApprovalRequest[] = [];
  displayedColumns = ['product', 'sku', 'quantity', 'requestedBy', 'remarks', 'createdAt', 'status', 'actions'];

  constructor(
    private stockService: StockService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadApprovalRequests();
  }

  loadApprovalRequests(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.id) {
      this.stockService.getVendorApprovalRequests(currentUser.id).subscribe({
        next: (requests) => this.approvalRequests = requests,
        error: (error) => {
          console.error('Error loading approval requests:', error);
          this.snackBar.open('Error loading approval requests', 'Close', { duration: 3000 });
        }
      });
    }
  }

  approveRequest(request: StockApprovalRequest): void {
    const dialogRef = this.dialog.open(ApprovalRemarksDialogComponent);
    dialogRef.componentInstance.data = {
      title: 'Approve Stock IN Request',
      action: 'Approve'
    };

    dialogRef.afterClosed().subscribe(remarks => {
      if (remarks !== null) {
        this.stockService.approveStockRequest(request.id, remarks).subscribe({
          next: () => {
            this.snackBar.open('Request approved successfully', 'Close', { duration: 3000 });
            this.loadApprovalRequests();
          },
          error: (error) => {
            const errorMsg = error.error?.message || 'Error approving request';
            this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  rejectRequest(request: StockApprovalRequest): void {
    const dialogRef = this.dialog.open(ApprovalRemarksDialogComponent);
    dialogRef.componentInstance.data = {
      title: 'Reject Stock IN Request',
      action: 'Reject'
    };

    dialogRef.afterClosed().subscribe(remarks => {
      if (remarks !== null) {
        this.stockService.rejectStockRequest(request.id, remarks).subscribe({
          next: () => {
            this.snackBar.open('Request rejected', 'Close', { duration: 3000 });
            this.loadApprovalRequests();
          },
          error: (error) => {
            const errorMsg = error.error?.message || 'Error rejecting request';
            this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
            console.error('Error:', error);
          }
        });
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}
