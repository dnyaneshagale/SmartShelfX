import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionService } from '../../../core/services/transaction.service';
import { ProductService } from '../../../core/services/product.service';
import { Product, MovementType } from '../../../core/models';

export interface StockDialogData {
    type: 'STOCK_IN' | 'STOCK_OUT';
    product?: Product;
}

@Component({
    selector: 'app-stock-dialog',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './stock-dialog.component.html',
    styleUrl: './stock-dialog.component.scss'
})
export class StockDialogComponent implements OnInit {
    stockForm: FormGroup;
    products: Product[] = [];
    isLoading = false;
    isSubmitting = false;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<StockDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: StockDialogData,
        private transactionService: TransactionService,
        private productService: ProductService
    ) {
        this.stockForm = this.fb.group({
            productId: [data.product?.id || '', Validators.required],
            quantity: ['', [Validators.required, Validators.min(1)]],
            reason: ['', Validators.required],
            reference: ['']
        });
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.isLoading = true;
        this.productService.getProducts().subscribe({
            next: (products) => {
                this.products = products;
                this.isLoading = false;
            },
            error: () => this.isLoading = false
        });
    }

    getDialogTitle(): string {
        return this.data.type === 'STOCK_IN' ? 'Record Stock In' : 'Record Stock Out';
    }

    getDialogIcon(): string {
        return this.data.type === 'STOCK_IN' ? 'add_circle' : 'remove_circle';
    }

    onSubmit(): void {
        if (this.stockForm.valid) {
            this.isSubmitting = true;
            const formData = this.stockForm.value;

            const request$ = this.data.type === 'STOCK_IN'
                ? this.transactionService.stockIn(formData)
                : this.transactionService.stockOut(formData);

            request$.subscribe({
                next: (result) => {
                    this.isSubmitting = false;
                    this.dialogRef.close(result);
                },
                error: (err) => {
                    this.isSubmitting = false;
                    console.error('Transaction failed:', err);
                }
            });
        }
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
