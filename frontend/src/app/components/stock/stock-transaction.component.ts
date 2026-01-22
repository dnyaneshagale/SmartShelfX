import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StockService } from '../../services/stock.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product, StockTransaction } from '../../models/models';

@Component({
  selector: 'app-stock-transaction',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatRadioModule, MatButtonModule,
    MatTableModule, MatSnackBarModule
  ],
  template: `
    <div class="stock-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Record Stock Transaction</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="transactionForm" (ngSubmit)="recordTransaction()">
            <mat-form-field>
              <mat-label>Product</mat-label>
              <mat-select formControlName="sku">
                @for (product of products; track product.id) {
                  <mat-option [value]="product.sku">{{product.name}} ({{product.sku}})</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-radio-group formControlName="transactionType">
              <mat-radio-button value="IN">Stock In</mat-radio-button>
              <mat-radio-button value="OUT">Stock Out</mat-radio-button>
            </mat-radio-group>

            <mat-form-field>
              <mat-label>Quantity</mat-label>
              <input matInput type="number" formControlName="quantity" />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Remarks</mat-label>
              <textarea matInput formControlName="remarks"></textarea>
            </mat-form-field>

            <button mat-raised-button color="primary" type="submit" 
                    [disabled]="!transactionForm.valid">
              Record Transaction
            </button>
          </form>
        </mat-card-content>
      </mat-card>

      <h2>Recent Transactions</h2>
      <table mat-table [dataSource]="transactions" class="mat-elevation-z8">
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Date</th>
          <td mat-cell *matCellDef="let txn">{{txn.transactionDate | date}}</td>
        </ng-container>

        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef>Product</th>
          <td mat-cell *matCellDef="let txn">{{txn.product.name}}</td>
        </ng-container>

        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Type</th>
          <td mat-cell *matCellDef="let txn">
            <span [class]="txn.transactionType === 'IN' ? 'type-in' : 'type-out'">
              {{txn.transactionType}}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef>Quantity</th>
          <td mat-cell *matCellDef="let txn">{{txn.quantity}}</td>
        </ng-container>

        <ng-container matColumnDef="remarks">
          <th mat-header-cell *matHeaderCellDef>Remarks</th>
          <td mat-cell *matCellDef="let txn">{{txn.remarks}}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .stock-container {
      padding: 20px;
    }

    mat-card {
      margin-bottom: 30px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    mat-radio-group {
      display: flex;
      gap: 20px;
      margin: 10px 0;
    }

    table {
      width: 100%;
    }

    .type-in {
      color: green;
      font-weight: bold;
    }

    .type-out {
      color: red;
      font-weight: bold;
    }
  `]
})
export class StockTransactionComponent implements OnInit {
  transactionForm: FormGroup;
  products: Product[] = [];
  transactions: StockTransaction[] = [];
  displayedColumns = ['date', 'product', 'type', 'quantity', 'remarks'];

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private productService: ProductService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.transactionForm = this.fb.group({
      sku: ['', Validators.required],
      transactionType: ['IN', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      remarks: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadTransactions();
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => this.products = products,
      error: (error) => console.error('Error loading products:', error)
    });
  }

  loadTransactions(): void {
    this.stockService.getAllTransactions().subscribe({
      next: (transactions) => this.transactions = transactions,
      error: (error) => console.error('Error loading transactions:', error)
    });
  }

  recordTransaction(): void {
    if (this.transactionForm.valid) {
      const formValue = this.transactionForm.value;
      const selectedProduct = this.products.find(p => p.sku === formValue.sku);
      
      if (!selectedProduct || !selectedProduct.id) {
        this.snackBar.open('Invalid product selected', 'Close', { duration: 3000 });
        return;
      }
      
      const currentUser = this.authService.getCurrentUser();
      
      const request = {
        productId: selectedProduct.id,
        transactionType: formValue.transactionType,
        quantity: formValue.quantity,
        remarks: formValue.remarks,
        requestedById: currentUser?.id
      };
      
      this.stockService.recordTransaction(request).subscribe({
        next: (response) => {
          // Check if it's an approval request or a direct transaction
          if (response.status && response.status === 'PENDING') {
            this.snackBar.open('Stock IN request sent to vendor for approval', 'Close', { duration: 3000 });
          } else {
            this.snackBar.open('Transaction recorded successfully', 'Close', { duration: 3000 });
          }
          this.transactionForm.reset({ transactionType: 'IN', quantity: 1 });
          this.loadTransactions();
          this.loadProducts();
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Error recording transaction';
          this.snackBar.open(errorMsg, 'Close', { duration: 3000 });
          console.error('Error:', error);
        }
      });
    }
  }
}
