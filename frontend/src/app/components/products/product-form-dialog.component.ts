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
          <mat-select formControlName="category" required (selectionChange)="onCategoryChange($event)">
            @for (cat of categories; track cat) {
              <mat-option [value]="cat">{{cat}}</mat-option>
            }
            <mat-option value="_ADD_NEW_">➕ Add new category</mat-option>
          </mat-select>
          @if (productForm.get('category')?.hasError('required') && productForm.get('category')?.touched) {
            <mat-error>Category is required</mat-error>
          }
        </mat-form-field>

        @if (showNewCategoryInput) {
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>New Category Name</mat-label>
            <input matInput formControlName="newCategory" placeholder="Enter new category name">
            @if (productForm.get('newCategory')?.hasError('required') && productForm.get('newCategory')?.touched) {
              <mat-error>Category name is required</mat-error>
            }
          </mat-form-field>
        }

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

    .new-category-hint {
      color: #666;
      font-size: 12px;
      margin-top: -10px;
      margin-bottom: 15px;
    }

    mat-dialog-actions {
      padding: 10px 20px;
    }
  `]
})
export class ProductFormDialogComponent {
  productForm: FormGroup;
  categories: string[] = ['Electronics', 'Accessories', 'Stationery', 'Furniture', 'Hardware'];
  showNewCategoryInput: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ProductFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product?: Product, vendors?: User[] }
  ) {
    this.productForm = this.fb.group({
      sku: [data?.product?.sku || '', Validators.required],
      name: [data?.product?.name || '', Validators.required],
      category: [data?.product?.category || '', Validators.required],
      newCategory: [''],
      price: [data?.product?.price || 0, [Validators.required, Validators.min(0)]],
      currentStock: [data?.product?.currentStock || 0, [Validators.required, Validators.min(0)]],
      reorderLevel: [data?.product?.reorderLevel || 0, [Validators.required, Validators.min(0)]],
      vendorId: [data?.product?.vendor?.id || null]
    });
  }

  onCategoryChange(event: any): void {
    const selectedValue = event.value;
    if (selectedValue === '_ADD_NEW_') {
      this.showNewCategoryInput = true;
      this.productForm.get('category')?.clearValidators();
      this.productForm.get('category')?.updateValueAndValidity();
      this.productForm.get('newCategory')?.setValidators([Validators.required]);
      this.productForm.get('newCategory')?.updateValueAndValidity();
    } else {
      this.showNewCategoryInput = false;
      this.productForm.get('category')?.setValidators([Validators.required]);
      this.productForm.get('category')?.updateValueAndValidity();
      this.productForm.get('newCategory')?.clearValidators();
      this.productForm.get('newCategory')?.setValue('');
      this.productForm.get('newCategory')?.updateValueAndValidity();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.productForm.valid) {
      const formValue = { ...this.productForm.value };
      
      // If user added a new category, use that as the category
      if (this.showNewCategoryInput && formValue.newCategory) {
        formValue.category = formValue.newCategory.trim();
        
        // Add the new category to the list if not already present
        if (!this.categories.includes(formValue.category)) {
          this.categories.push(formValue.category);
          this.categories.sort();
        }
      }
      
      // Remove the newCategory field before returning
      delete formValue.newCategory;
      
      this.dialogRef.close(formValue);
    }
  }
}
