import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../../../core/services/product.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product, Category, ProductCreateRequest, ProductUpdateRequest, User } from '../../../core/models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  categories: Category[] = [];
  vendors: User[] = [];
  isLoading = false;
  isEditMode = false;
  productId: number | null = null;
  currentUser: User | null = null;

  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  get isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  get isVendor(): boolean {
    return this.currentUser?.role === 'VENDOR';
  }

  get isWarehouseManager(): boolean {
    return this.currentUser?.role === 'WAREHOUSEMANAGER';
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    // Check if vendor is trying to create a new product (not allowed)
    const id = this.route.snapshot.paramMap.get('id');
    if (!id && this.isVendor) {
      alert('Vendors cannot create new products. You can only edit your existing products.');
      this.router.navigate(['/inventory']);
      return;
    }

    this.initForm();
    this.loadCategories();
    if (this.isAdmin) {
      this.loadVendors();
    }

    if (id) {
      this.isEditMode = true;
      this.productId = +id;
      this.loadProduct();
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      sku: ['', [Validators.required]],
      description: [''],
      categoryId: [null, [Validators.required]],
      vendorId: [null, this.isAdmin ? [Validators.required] : []],
      currentStock: [0, [Validators.required, Validators.min(0)]],
      reorderLevel: [10, [Validators.required, Validators.min(0)]],
      reorderQuantity: [50, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.min(0)]],
      unit: ['pieces'],
      imageUrl: ['']
    });

    // Role-based field restrictions
    if (this.isEditMode) {
      // Always disable SKU in edit mode (all roles)
      this.productForm.get('sku')?.disable();
      
      // Vendors cannot edit SKU or category in edit mode (only description, images, pricing)
      if (this.isVendor) {
        this.productForm.get('categoryId')?.disable();
        this.productForm.get('currentStock')?.disable();
        this.productForm.get('reorderLevel')?.disable();
        this.productForm.get('reorderQuantity')?.disable();
      }
      
      // Warehouse managers cannot edit SKU or vendorId in edit mode
      if (this.isWarehouseManager) {
        this.productForm.get('vendorId')?.disable();
      }
      
      // Always disable vendorId in edit mode
      this.productForm.get('vendorId')?.disable();
    }
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
        console.log('📦 Categories loaded:', categories);
      },
      error: (err) => {
        console.error('❌ Error loading categories:', err);
      }
    });
  }

  createNewCategory(): void {
    const categoryName = prompt('Enter category name:');
    if (!categoryName || categoryName.trim() === '') {
      return;
    }

    const description = prompt('Enter category description (optional):', '');

    console.log('📝 Creating new category:', categoryName);

    this.productService.createCategory(categoryName, description || undefined).subscribe({
      next: (newCategory: Category) => {
        console.log('✅ Category created successfully:', newCategory);
        this.categories.push(newCategory);
        this.productForm.get('categoryId')?.setValue(newCategory.id);
        alert('Category created successfully!');
      },
      error: (err) => {
        console.error('❌ Error creating category:', err);
        const errorMsg = err?.error?.message || err?.message || 'Unknown error';
        alert('Error creating category: ' + errorMsg);
      }
    });
  }

  loadVendors(): void {
    this.authService.getUsers().subscribe({
      next: (users: User[]) => {
        this.vendors = users.filter(u => u.role === 'VENDOR' || u.role === 'ADMIN');
      }
    });
  }

  loadProduct(): void {
    if (this.productId) {
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: (product: Product) => {
          this.productForm.patchValue({
            name: product.name,
            sku: product.sku,
            description: product.description,
            categoryId: product.categoryId,
            vendorId: product.vendorId,
            currentStock: product.currentStock,
            reorderLevel: product.reorderLevel,
            reorderQuantity: product.reorderQuantity,
            unitPrice: product.unitPrice,
            costPrice: product.costPrice,
            unit: product.unit,
            imageUrl: product.imageUrl
          });
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const formValue = this.productForm.getRawValue();

      if (this.isEditMode && this.productId) {
        const updateRequest: ProductUpdateRequest = {
          name: formValue.name,
          description: formValue.description,
          categoryId: formValue.categoryId,
          reorderLevel: formValue.reorderLevel,
          reorderQuantity: formValue.reorderQuantity,
          unitPrice: formValue.unitPrice,
          costPrice: formValue.costPrice,
          unit: formValue.unit,
          imageUrl: formValue.imageUrl
        };
        this.productService.updateProduct(this.productId, updateRequest).subscribe({
          next: () => {
            console.log('✅ Product updated successfully');
            this.isLoading = false;
            this.router.navigate(['/inventory']).then(() => {
              console.log('✅ Navigated to inventory, refreshing...');
              setTimeout(() => window.location.reload(), 500);
            });
          },
          error: (err) => {
            console.error('❌ Error updating product:', err);
            this.isLoading = false;
            alert('Error updating product: ' + (err?.error?.message || err?.message || 'Unknown error'));
          }
        });
      } else {
        // For non-admin, use their own ID as vendorId
        const vendorId = this.isAdmin ? formValue.vendorId : this.currentUser?.id;

        if (!vendorId) {
          console.error('❌ Vendor ID is required for product creation');
          this.isLoading = false;
          alert('Error: Vendor ID not found. Please try again.');
          return;
        }

        const createRequest: ProductCreateRequest = {
          name: formValue.name,
          sku: formValue.sku,
          description: formValue.description,
          categoryId: formValue.categoryId,
          vendorId: vendorId,
          currentStock: formValue.currentStock,
          reorderLevel: formValue.reorderLevel,
          reorderQuantity: formValue.reorderQuantity,
          unitPrice: formValue.unitPrice,
          costPrice: formValue.costPrice,
          unit: formValue.unit,
          imageUrl: formValue.imageUrl
        };

        console.log('📤 Creating product with request:', createRequest);

        this.productService.createProduct(createRequest).subscribe({
          next: (product) => {
            console.log('✅ Product created successfully:', product);
            this.isLoading = false;
            alert('Product created successfully!');
            this.router.navigate(['/inventory']).then(() => {
              console.log('✅ Navigated to inventory, refreshing...');
              setTimeout(() => window.location.reload(), 500);
            });
          },
          error: (err) => {
            console.error('❌ Error creating product:', err);
            this.isLoading = false;
            const errorMsg = err?.error?.message || err?.message || 'Unknown error';
            alert('Error creating product: ' + errorMsg);
          }
        });
      }
    } else {
      console.warn('⚠️ Form is invalid');
      alert('Please fill in all required fields');
    }
  }

  cancel(): void {
    this.router.navigate(['/inventory']);
  }
}
