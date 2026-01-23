import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { ManagerApprovalService, ManagerApprovalRequest } from '../../services/manager-approval.service';

@Component({
  selector: 'app-approval-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './approval-requests.component.html',
  styleUrls: ['./approval-requests.component.css']
})
export class ApprovalRequestsComponent implements OnInit {
  displayedColumns: string[] = ['fullName', 'username', 'email', 'requestedAt', 'status', 'actions'];
  pendingRequests: ManagerApprovalRequest[] = [];
  allRequests: ManagerApprovalRequest[] = [];
  showAll = false;

  constructor(
    private approvalService: ManagerApprovalService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    if (this.showAll) {
      this.approvalService.getAllRequests().subscribe({
        next: (data) => {
          this.allRequests = data;
        },
        error: (err) => {
          this.snackBar.open('Failed to load requests', 'Close', { duration: 3000 });
        }
      });
    } else {
      this.approvalService.getPendingRequests().subscribe({
        next: (data) => {
          this.pendingRequests = data;
        },
        error: (err) => {
          this.snackBar.open('Failed to load pending requests', 'Close', { duration: 3000 });
        }
      });
    }
  }

  toggleView(): void {
    this.showAll = !this.showAll;
    this.loadRequests();
  }

  approveRequest(id: number): void {
    const remarks = prompt('Enter remarks (optional):') || 'Approved by admin';
    
    this.approvalService.approveRequest(id, remarks).subscribe({
      next: () => {
        this.snackBar.open('Manager request approved successfully', 'Close', { duration: 3000 });
        this.loadRequests();
      },
      error: (err) => {
        this.snackBar.open('Failed to approve request', 'Close', { duration: 3000 });
      }
    });
  }

  rejectRequest(id: number): void {
    const remarks = prompt('Enter reason for rejection:') || 'Rejected by admin';
    
    this.approvalService.rejectRequest(id, remarks).subscribe({
      next: () => {
        this.snackBar.open('Manager request rejected', 'Close', { duration: 3000 });
        this.loadRequests();
      },
      error: (err) => {
        this.snackBar.open('Failed to reject request', 'Close', { duration: 3000 });
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'accent';
      case 'APPROVED':
        return 'primary';
      case 'REJECTED':
        return 'warn';
      default:
        return '';
    }
  }

  get requests(): ManagerApprovalRequest[] {
    return this.showAll ? this.allRequests : this.pendingRequests;
  }
}
