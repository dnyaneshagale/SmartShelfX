package com.smartshelfx.controller;

import com.smartshelfx.dto.PurchaseOrderRequest;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {
    
    @Autowired
    private PurchaseOrderService purchaseOrderService;
    
    @GetMapping
    public ResponseEntity<List<PurchaseOrder>> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<PurchaseOrder>> getPurchaseOrdersByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(purchaseOrderService.getPurchaseOrdersByVendor(vendorId));
    }
    
    @GetMapping("/pending")
    public ResponseEntity<List<PurchaseOrder>> getPendingPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getPendingPurchaseOrders());
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseOrder> createPurchaseOrder(@RequestBody PurchaseOrderRequest request) {
        return ResponseEntity.ok(purchaseOrderService.createPurchaseOrder(request));
    }
    
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<PurchaseOrder> approvePurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.approvePurchaseOrder(id));
    }
    
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<PurchaseOrder> rejectPurchaseOrder(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseOrderService.rejectPurchaseOrder(id));
    }
}
