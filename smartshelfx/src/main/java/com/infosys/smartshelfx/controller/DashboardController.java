package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.service.DashboardService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@AllArgsConstructor
public class DashboardController {

    private DashboardService dashboardService;

    /**
     * Get dashboard data based on user role
     * Returns role-specific dashboard cards and navigation items
     */
    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getDashboardData(authentication));
    }

    /**
     * Get inventory level statistics
     */
    @GetMapping("/inventory-level")
    public ResponseEntity<InventoryLevelCard> getInventoryLevel() {
        return ResponseEntity.ok(dashboardService.getInventoryLevelCard());
    }

    /**
     * Get low stock alerts
     */
    @GetMapping("/low-stock-alerts")
    public ResponseEntity<LowStockAlertCard> getLowStockAlerts() {
        return ResponseEntity.ok(dashboardService.getLowStockAlertCard());
    }

    /**
     * Get auto-restock status
     */
    @GetMapping("/auto-restock-status")
    public ResponseEntity<AutoRestockStatusCard> getAutoRestockStatus() {
        return ResponseEntity.ok(dashboardService.getAutoRestockStatusCard());
    }

    /**
     * Admin-only endpoint - Get all users summary
     */
    @GetMapping("/admin/users-summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUsersSummary() {
        return ResponseEntity.ok(dashboardService.getUsersSummary());
    }

    /**
     * Warehouse Manager endpoint - Get warehouse overview
     */
    @GetMapping("/warehouse/overview")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<?> getWarehouseOverview() {
        return ResponseEntity.ok(dashboardService.getWarehouseOverview());
    }

    /**
     * Vendor endpoint - Get pending orders
     */
    @GetMapping("/vendor/pending-orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<?> getVendorPendingOrders(Authentication authentication) {
        return ResponseEntity.ok(dashboardService.getVendorPendingOrders(authentication));
    }
}
