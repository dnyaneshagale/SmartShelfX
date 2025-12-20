package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.ReorderStatus;
import com.infosys.smartshelfx.entity.Role;
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
 * Warehouse Manager Controller - Operational Control
 * - Update current stock levels (receiving, dispatching, adjustments)
 * - View and filter inventory by category, vendor, stock status
 * - Trigger reorder requests when stock falls below reorder level
 * - Batch import stock updates (CSV from warehouse systems)
 * - Stock movement logs (in/out history)
 * - Reorder alerts specific to their warehouse
 * 
 * Restrictions:
 * - Cannot delete products
 * - Cannot change SKU or vendor assignment
 * - Warehouse Managers can only see their own products
 */
@RestController
@RequestMapping("/api/warehouse")
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
@RequiredArgsConstructor
public class WarehouseController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final InventoryService inventoryService;
    private final CsvService csvService;

    private Long getCurrentUserId(Authentication authentication) {
        if (authentication.getPrincipal() instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ==================== PRODUCT VIEWING ====================

    /**
     * Get all products with filters - filtered by createdBy for Warehouse Managers
     */
    @GetMapping("/products")
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            Authentication authentication,
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

        // Admin sees all, Warehouse Manager sees only their own products
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(productService.getAllProducts(filter));
        } else {
            Long userId = getCurrentUserId(authentication);
            return ResponseEntity.ok(productService.getProductsByCreatedBy(userId, filter));
        }
    }

    /**
     * Get product by ID
     */
    @GetMapping("/products/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    /**
     * Get product by SKU
     */
    @GetMapping("/products/sku/{sku}")
    public ResponseEntity<ProductDTO> getProductBySku(@PathVariable String sku) {
        return ResponseEntity.ok(productService.getProductBySku(sku));
    }

    /**
     * Get all categories
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    /**
     * Create category (warehouse managers can create categories)
     */
    @PostMapping("/categories")
    public ResponseEntity<CategoryDTO> createCategory(
            @RequestParam String name,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(categoryService.createCategory(name, description));
    }

    /**
     * Update product (limited fields - cannot change SKU or vendor)
     */
    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {
        // Warehouse manager cannot change SKU or vendor - pass false for isAdmin
        return ResponseEntity.ok(productService.updateProduct(id, request, false));
    }

    /**
     * Create product (for Warehouse Managers)
     */
    @PostMapping("/products")
    public ResponseEntity<ProductDTO> createProduct(
            Authentication authentication,
            @Valid @RequestBody ProductCreateRequest request) {
        return ResponseEntity.ok(productService.createProduct(request));
    }

    /**
     * Get low stock products - filtered by createdBy for Warehouse Managers
     */
    @GetMapping("/products/low-stock")
    public ResponseEntity<List<ProductDTO>> getLowStockProducts(Authentication authentication) {
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(productService.getLowStockProducts());
        } else {
            Long userId = getCurrentUserId(authentication);
            return ResponseEntity.ok(productService.getLowStockProductsByCreatedBy(userId));
        }
    }

    /**
     * Get out of stock products - filtered by createdBy for Warehouse Managers
     */
    @GetMapping("/products/out-of-stock")
    public ResponseEntity<List<ProductDTO>> getOutOfStockProducts(Authentication authentication) {
        if (isAdmin(authentication)) {
            return ResponseEntity.ok(productService.getOutOfStockProducts());
        } else {
            Long userId = getCurrentUserId(authentication);
            return ResponseEntity.ok(productService.getOutOfStockProductsByCreatedBy(userId));
        }
    }

    // ==================== STOCK MANAGEMENT ====================

    /**
     * Update stock (receiving, dispatching, adjustments)
     */
    @PostMapping("/stock/update")
    public ResponseEntity<StockMovementDTO> updateStock(@Valid @RequestBody StockUpdateRequest request) {
        return ResponseEntity.ok(inventoryService.updateStock(request));
    }

    /**
     * Get stock movement history for a product
     */
    @GetMapping("/stock/movements/{productId}")
    public ResponseEntity<Page<StockMovementDTO>> getStockMovements(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(inventoryService.getStockMovements(productId, page, size));
    }

    /**
     * Batch import stock updates from CSV
     */
    @PostMapping(value = "/stock/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CsvImportResult> importStockUpdates(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(csvService.importStockUpdates(file));
    }

    /**
     * Download stock update template
     */
    @GetMapping("/stock/template")
    public ResponseEntity<byte[]> downloadStockTemplate() {
        byte[] template = csvService.exportStockUpdateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=stock_update_template.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(template);
    }

    // ==================== REORDER MANAGEMENT ====================

    /**
     * Create reorder request
     */
    @PostMapping("/reorders")
    public ResponseEntity<ReorderRequestDTO> createReorderRequest(
            @Valid @RequestBody ReorderCreateRequest request) {
        return ResponseEntity.ok(inventoryService.createReorderRequest(request));
    }

    /**
     * Get reorder requests
     */
    @GetMapping("/reorders")
    public ResponseEntity<Page<ReorderRequestDTO>> getReorderRequests(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ReorderStatus reorderStatus = status != null ? ReorderStatus.valueOf(status) : null;
        return ResponseEntity.ok(inventoryService.getReorderRequests(reorderStatus, page, size));
    }

    // ==================== INVENTORY STATS ====================

    /**
     * Get inventory statistics
     */
    @GetMapping("/inventory/stats")
    public ResponseEntity<InventoryStatsDTO> getInventoryStats() {
        return ResponseEntity.ok(inventoryService.getInventoryStats());
    }

    // ==================== EXPORT ====================

    /**
     * Export products to CSV (for inventory audit)
     */
    @GetMapping("/products/export")
    public ResponseEntity<byte[]> exportProducts() {
        byte[] csvContent = csvService.exportProducts(null);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=inventory_audit.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvContent);
    }
}
