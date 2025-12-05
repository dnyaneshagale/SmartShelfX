package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.AuditAction;
import com.infosys.smartshelfx.entity.ReorderStatus;
import com.infosys.smartshelfx.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Admin Controller - Full Control (Superuser)
 * - Add, edit, delete products
 * - Manage product details (SKU, category, vendor, reorder level, stock)
 * - Batch import/export via CSV
 * - Configure filters (Category, Vendor, Stock status)
 * - Assign vendors to products
 * - Set user roles & permissions
 * - View audit logs (who updated what, when)
 */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final InventoryService inventoryService;
    private final AuditLogService auditLogService;
    private final CsvService csvService;
    private final UserService userService;

    // ==================== PRODUCT MANAGEMENT ====================

    /**
     * Get all products with filters
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) String stockStatus,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        ProductFilterRequest filter = ProductFilterRequest.builder()
                .categoryId(categoryId)
                .vendorId(vendorId)
                .stockStatus(
                        stockStatus != null ? com.infosys.smartshelfx.entity.StockStatus.valueOf(stockStatus) : null)
                .searchTerm(search)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();

        return ResponseEntity.ok(productService.getAllProducts(filter));
    }

    /**
     * Get product by ID
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Create new product
     */
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    /**
     * Update product (Admin has full access to all fields)
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request, true));
    }

    /**
     * Delete product
     */
    @DeleteMapping("/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get low stock products
     */
    @GetMapping("/products/low-stock")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    /**
     * Get out of stock products
     */
    @GetMapping("/products/out-of-stock")
    public ResponseEntity<List<ProductDTO>> getOutOfStockProducts() {
        return ResponseEntity.ok(productService.getOutOfStockProducts());
    }

    // ==================== CATEGORY MANAGEMENT ====================

    /**
     * Get all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Create category
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(categoryService.createCategory(name, description));
    }

    /**
     * Update category
     */
    @PutMapping("/categories/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(categoryService.updateCategory(id, name, description));
    }

    /**
     * Delete category
     */
    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // ==================== INVENTORY STATS ====================

    /**
     * Get overall inventory statistics
     */
    @GetMapping("/inventory/stats")
    public ResponseEntity<InventoryStatsDTO> getInventoryStats() {
        return ResponseEntity.ok(inventoryService.getInventoryStats());
    }

    // ==================== REORDER MANAGEMENT ====================

    /**
     * Get all reorder requests
     */
    @GetMapping("/reorders")
    public ResponseEntity<Page<ReorderRequestDTO>> getReorderRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ReorderStatus reorderStatus = status != null ? ReorderStatus.valueOf(status) : null;
        return ResponseEntity.ok(inventoryService.getReorderRequests(reorderStatus, page, size));
    }

    /**
     * Approve reorder request
     */
    @PutMapping("/reorders/{id}/approve")
    public ResponseEntity<ReorderRequestDTO> approveReorder(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.approveReorderRequest(id));
    }

    /**
     * Reject reorder request
     */
    @PutMapping("/reorders/{id}/reject")
    public ResponseEntity<ReorderRequestDTO> rejectReorder(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(inventoryService.rejectReorderRequest(id, reason));
    }

    /**
     * Fulfill reorder request
     */
    @PutMapping("/reorders/{id}/fulfill")
    public ResponseEntity<ReorderRequestDTO> fulfillReorder(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.fulfillReorderRequest(id));
    }

    // ==================== AUDIT LOGS ====================

    /**
     * Get audit logs with filters
     */
    @GetMapping("/audit-logs")
    public ResponseEntity<Page<AuditLogDTO>> getAuditLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        AuditAction auditAction = action != null ? AuditAction.valueOf(action) : null;
        return ResponseEntity.ok(auditLogService.getAuditLogs(entityType, auditAction, userId, page, size));
    }

    /**
     * Get recent audit logs
     */
    @GetMapping("/audit-logs/recent")
    public ResponseEntity<List<AuditLogDTO>> getRecentAuditLogs() {
        return ResponseEntity.ok(auditLogService.getRecentAuditLogs());
    }

    /**
     * Get audit logs for specific entity
     */
    @GetMapping("/audit-logs/{entityType}/{entityId}")
    public ResponseEntity<Page<AuditLogDTO>> getEntityAuditLogs(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogService.getAuditLogsByEntity(entityType, entityId, page, size));
    }

    // ==================== CSV IMPORT/EXPORT ====================

    /**
     * Import products from CSV
     */
    @PostMapping(value = "/products/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResult> importProducts(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long vendorId) {
        return ResponseEntity.ok(csvService.importProducts(file, vendorId));
    }

    /**
     * Export products to CSV
     */
    @GetMapping("/products/export")
    public ResponseEntity<byte[]> exportProducts(
            @RequestParam(required = false) Long vendorId) {
        byte[] csvContent = csvService.exportProducts(vendorId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=products.csv")
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

    // ==================== USER MANAGEMENT ====================

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /**
     * Update user role
     */
    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }

    /**
     * Enable/Disable user
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<UserDTO> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(userService.updateUserStatus(id, enabled));
    }

    // ==================== VENDOR MANAGEMENT ====================

    /**
     * Get vendor performance stats
     */
    @GetMapping("/vendors/{vendorId}/stats")
    public ResponseEntity<VendorStatsDTO> getVendorStats(@PathVariable Long vendorId) {
        return ResponseEntity.ok(inventoryService.getVendorStats(vendorId));
    }
}
