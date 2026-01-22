import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { Product, User } from '../../models/models';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data?.product ? 'Edit Product' : 'Add Product' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="productForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>SKU</mat-label>
          <input matInput formControlName="sku" required>
          @if (productForm.get('sku')?.hasError('required') && productForm.get('sku')?.touched) {
            <mat-error>SKU is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Product Name</mat-label>
          <input matInput formControlName="name" required>
          @if (productForm.get('name')?.hasError('required') && productForm.get('name')?.touched) {
            <mat-error>Name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Category</mat-label>
          <mat-select formControlName="category" required>
            <mat-option value="Electronics">Electronics</mat-option>
            <mat-option value="Accessories">Accessories</mat-option>
            <mat-option value="Stationery">Stationery</mat-option>
            <mat-option value="Furniture">Furniture</mat-option>
            <mat-option value="Hardware">Hardware</mat-option>
          </mat-select>
          @if (productForm.get('category')?.hasError('required') && productForm.get('category')?.touched) {
            <mat-error>Category is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Price</mat-label>
          <input matInput type="number" formControlName="price" required min="0" step="0.01">
          @if (productForm.get('price')?.hasError('required') && productForm.get('price')?.touched) {
            <mat-error>Price is required</mat-error>
          }
          @if (productForm.get('price')?.hasError('min') && productForm.get('price')?.touched) {
            <mat-error>Price must be positive</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Current Stock</mat-label>
          <input matInput type="number" formControlName="currentStock" required min="0">
          @if (productForm.get('currentStock')?.hasError('required') && productForm.get('currentStock')?.touched) {
            <mat-error>Current stock is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Reorder Level</mat-label>
          <input matInput type="number" formControlName="reorderLevel" required min="0">
          @if (productForm.get('reorderLevel')?.hasError('required') && productForm.get('reorderLevel')?.touched) {
            <mat-error>Reorder level is required</mat-error>
          }
        </mat-form-field>

        @if (data?.vendors && data.vendors.length > 0) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Vendor</mat-label>
            <mat-select formControlName="vendorId">
              <mat-option [value]="null">No Vendor</mat-option>
              @for (vendor of data.vendors; track vendor.id) {
                <mat-option [value]="vendor.id">{{ vendor.fullName || vendor.username }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        }
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" [disabled]="!productForm.valid" (click)="onSave()">
        {{ data?.product ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 400px;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }

    mat-dialog-actions {
      padding: 10px 20px;
    }
  `]
})
export class ProductFormDialogComponent {
  productForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product, vendors?: User[] }
  ) {
    this.productForm = this.fb.group({
      sku: [data?.product?.sku || '', Validators.required],
      name: [data?.product?.name || '', Validators.required],
      category: [data?.product?.category || '', Validators.required],
      price: [data?.product?.price || 0, [Validators.required, Validators.min(0)]],
      currentStock: [data?.product?.currentStock || 0, [Validators.required, Validators.min(0)]],
      reorderLevel: [data?.product?.reorderLevel || 0, [Validators.required, Validators.min(0)]],
      vendorId: [data?.product?.vendor?.id || null]
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      this.dialogRef.close(this.productForm.value);
    }
  }
}
