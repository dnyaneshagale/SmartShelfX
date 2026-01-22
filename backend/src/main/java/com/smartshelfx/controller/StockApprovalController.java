package com.smartshelfx.controller;

import com.smartshelfx.model.StockApprovalRequest;
import com.smartshelfx.service.StockApprovalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stock-approvals")
@CrossOrigin(origins = "*")
public class StockApprovalController {
    
    @Autowired
    private StockApprovalService stockApprovalService;
    
    @GetMapping("/vendor/{vendorId}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<StockApprovalRequest>> getVendorRequests(@PathVariable Long vendorId) {
        return ResponseEntity.ok(stockApprovalService.getRequestsByVendor(vendorId));
    }
    
    @GetMapping("/vendor/{vendorId}/pending")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<List<StockApprovalRequest>> getVendorPendingRequests(@PathVariable Long vendorId) {
        return ResponseEntity.ok(stockApprovalService.getPendingRequestsByVendor(vendorId));
    }
    
    @PutMapping("/{requestId}/approve")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StockApprovalRequest> approveRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(stockApprovalService.approveRequest(requestId, remarks));
    }
    
    @PutMapping("/{requestId}/reject")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StockApprovalRequest> rejectRequest(
            @PathVariable Long requestId,
            @RequestBody(required = false) Map<String, String> body) {
        String remarks = body != null ? body.get("remarks") : null;
        return ResponseEntity.ok(stockApprovalService.rejectRequest(requestId, remarks));
    }
    
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<StockApprovalRequest>> getAllRequests() {
        return ResponseEntity.ok(stockApprovalService.getAllRequests());
    }
}
