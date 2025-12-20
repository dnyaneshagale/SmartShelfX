package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Vendor Controller - Limited Access (Vendor Portal)
 * - View only their own products in the catalog
 * - See stock status and reorder requests related to their products
 * - Update product details like description, images, pricing (but not SKU or
 * category)
 * - Upload product batches via CSV (restricted to their products)
 * - Notifications when stock is low for their products
 * - Sales & order reports for their items
 * 
 * Restrictions:
 * - Cannot delete products
 * - Cannot view other vendors' products
 * - Cannot change SKU or category
 */
@RestController
@RequestMapping("/api/vendor")
@PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
@RequiredArgsConstructor
public class VendorController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final InventoryService inventoryService;
    private final CsvService csvService;
    private final UserService userService;

    // ==================== PRODUCT MANAGEMENT (OWN PRODUCTS ONLY)
    // ====================

    /**
     * Get vendor's own products with filters
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductDTO>> getMyProducts(
            Authentication authentication,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        Long vendorId = getCurrentVendorId(authentication);

        ProductFilterRequest filter = ProductFilterRequest.builder()
                .categoryId(categoryId)
                .stockStatus(
                        stockStatus != null ? com.infosys.smartshelfx.entity.StockStatus.valueOf(stockStatus) : null)
                .searchTerm(search)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return ResponseEntity.ok(productService.getProductsByVendor(vendorId, filter));
    }

    /**
     * Get product by ID (only if owned by vendor)
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable Long id,
            Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        ProductDTO product = productService.getProductById(id);

        // Verify ownership
        if (!product.getVendorId().equals(vendorId)) {
            return ResponseEntity.status(403).build();
        }

        return ResponseEntity.ok(product);
    }

    /**
     * Update product (limited fields - description, images, pricing only)
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request,
            Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(productService.updateProductForVendor(id, request, vendorId));
    }

    /**
     * Get categories (for reference)
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Create category (vendors can create categories for their products)
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(categoryService.createCategory(name, description));
    }

    /**
     * Get low stock products for this vendor
     */
    @GetMapping("/products/low-stock")
    public ResponseEntity<List<ProductDTO>> getMyLowStockProducts(Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(productService.getLowStockProductsByVendor(vendorId));
    }

    // ==================== STOCK & REORDER VIEWING ====================

    /**
     * Get stock movement history for vendor's products
     */
    @GetMapping("/stock/movements")
    public ResponseEntity<Page<StockMovementDTO>> getStockMovements(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(inventoryService.getStockMovementsByVendor(vendorId, page, size));
    }

    /**
     * Get reorder requests for vendor's products
     */
    @GetMapping("/reorders")
    public ResponseEntity<Page<ReorderRequestDTO>> getMyReorderRequests(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(inventoryService.getReorderRequestsByVendor(vendorId, page, size));
    }

    // ==================== VENDOR STATS ====================

    /**
     * Get vendor statistics (own products only)
     */
    @GetMapping("/stats")
    public ResponseEntity<VendorStatsDTO> getMyStats(Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(inventoryService.getVendorStats(vendorId));
    }

    // ==================== CSV IMPORT/EXPORT ====================

    /**
     * Import products from CSV (restricted to vendor's own products)
     */
    @PostMapping(value = "/products/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResult> importProducts(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        return ResponseEntity.ok(csvService.importProducts(file, vendorId));
    }

    /**
     * Export vendor's products to CSV
     */
    @GetMapping("/products/export")
    public ResponseEntity<byte[]> exportMyProducts(Authentication authentication) {
        Long vendorId = getCurrentVendorId(authentication);
        byte[] csvContent = csvService.exportProducts(vendorId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my_products.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }

    /**
     * Download product import template
     */
    @GetMapping("/products/template")
    public ResponseEntity<byte[]> downloadProductTemplate() {
        byte[] template = csvService.exportProductTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=product_template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    // ==================== HELPER METHODS ====================

    private Long getCurrentVendorId(Authentication authentication) {
        String username = authentication.getName();
        return userService.findByUsername(username).getId();
    }
}
