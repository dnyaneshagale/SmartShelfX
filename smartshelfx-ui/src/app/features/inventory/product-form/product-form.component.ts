import { Component, OnInit } from '@angular/core';
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
import { Product, Category, ProductCreateRequest, ProductUpdateRequest } from '../../../core/models';

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
  isLoading = false;
  isEditMode = false;
  productId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCategories();
    
    const id = this.route.snapshot.paramMap.get('id');
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
      quantity: [0, [Validators.required, Validators.min(0)]],
      minQuantity: [0, [Validators.required, Validators.min(0)]],
      maxQuantity: [100, [Validators.required, Validators.min(1)]],
      reorderPoint: [10, [Validators.required, Validators.min(0)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      costPrice: [0, [Validators.required, Validators.min(0)]],
      location: ['']
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories: Category[]) => this.categories = categories
    });
  }

  loadProduct(): void {
    if (this.productId) {
      this.isLoading = true;
      this.productService.getProduct(this.productId).subscribe({
        next: (product: Product) => {
          this.productForm.patchValue(product);
          this.isLoading = false;
        },
        error: () => this.isLoading = false
      });
    }
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      this.isLoading = true;
      const productData = this.productForm.value;

      if (this.isEditMode && this.productId) {
        const updateRequest: ProductUpdateRequest = { ...productData, id: this.productId };
        this.productService.updateProduct(this.productId, updateRequest).subscribe({
          next: () => { this.isLoading = false; this.router.navigate(['/inventory']); },
          error: () => this.isLoading = false
        });
      } else {
        const createRequest: ProductCreateRequest = productData;
        this.productService.createProduct(createRequest).subscribe({
          next: () => { this.isLoading = false; this.router.navigate(['/inventory']); },
          error: () => this.isLoading = false
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/inventory']);
  }
}
