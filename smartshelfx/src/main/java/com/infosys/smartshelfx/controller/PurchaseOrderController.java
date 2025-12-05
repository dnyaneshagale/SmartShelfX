package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.PurchaseOrderStatus;
import com.infosys.smartshelfx.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Purchase Order Controller
 * - Create and manage purchase orders
 * - Auto-generate POs based on AI suggestions
 * - Approval workflow
 */
@RestController
@RequestMapping("/api/purchase-orders")
@RequiredArgsConstructor
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    // ==================== CREATE & MANAGE ====================

    /**
     * Create a new purchase order
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<PurchaseOrderDTO> createPurchaseOrder(
            @Valid @RequestBody PurchaseOrderCreateRequest request) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(request));
    }

    /**
     * Auto-generate POs based on restock suggestions
     */
    @PostMapping("/auto-generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PurchaseOrderDTO>> autoGeneratePurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.autoGeneratePurchaseOrders());
    }

    /**
     * Get restock suggestions for PO generation
     */
    @GetMapping("/suggestions")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<List<RestockSuggestionDTO>> getRestockSuggestions() {
        return ResponseEntity.ok(purchaseOrderService.getRestockSuggestions());
    }

    // ==================== RETRIEVAL ====================

    /**
     * Get all purchase orders with filters
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<Page<PurchaseOrderDTO>> getPurchaseOrders(
            @RequestParam(required = false) Long vendorId,
            @RequestParam(required = false) PurchaseOrderStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrders(
                vendorId, status, startDate, endDate, page, size));
    }

    /**
     * Get purchase order by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER', 'VENDOR')")
    public ResponseEntity<PurchaseOrderDTO> getPurchaseOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrderById(id));
    }

    /**
     * Get purchase orders for vendor
     */
    @GetMapping("/vendor")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<Page<PurchaseOrderDTO>> getVendorPurchaseOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long vendorId = getVendorIdFromAuth(authentication);
        return ResponseEntity.ok(purchaseOrderService.getVendorPurchaseOrders(vendorId, page, size));
    }

    // ==================== WORKFLOW ====================

    /**
     * Submit PO for approval
     */
    @PutMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<PurchaseOrderDTO> submitForApproval(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.submitForApproval(id));
    }

    /**
     * Approve purchase order
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PurchaseOrderDTO> approvePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.approvePurchaseOrder(id));
    }

    /**
     * Reject purchase order
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PurchaseOrderDTO> rejectPurchaseOrder(
            @PathVariable Long id,
            @RequestParam String reason) {
        return ResponseEntity.ok(purchaseOrderService.rejectPurchaseOrder(id, reason));
    }

    /**
     * Mark PO items as received
     */
    @PutMapping("/{id}/receive")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<PurchaseOrderDTO> receivePurchaseOrder(
            @PathVariable Long id,
            @RequestBody List<PurchaseOrderItemDTO> receivedItems) {
        return ResponseEntity.ok(purchaseOrderService.receivePurchaseOrder(id, receivedItems));
    }

    private Long getVendorIdFromAuth(Authentication authentication) {
        if (authentication.getPrincipal() instanceof com.infosys.smartshelfx.service.UserDetailsImpl) {
            return ((com.infosys.smartshelfx.service.UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }
}
