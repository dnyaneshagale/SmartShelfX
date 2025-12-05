package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.*;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@AllArgsConstructor
public class DashboardService {

    /**
     * Get complete dashboard data based on user role
     */
    public DashboardResponse getDashboardData(Authentication authentication) {
        String username = authentication.getName();
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("ROLE_USER")
                .replace("ROLE_", "");

        return DashboardResponse.builder()
                .username(username)
                .role(role)
                .inventoryLevel(getInventoryLevelCard())
                .lowStockAlerts(getLowStockAlertCard())
                .autoRestockStatus(getAutoRestockStatusCard())
                .navigationItems(getNavigationItemsByRole(role))
                .build();
    }

    /**
     * Get navigation items based on user role
     */
    private List<String> getNavigationItemsByRole(String role) {
        List<String> commonItems = new ArrayList<>(Arrays.asList(
                "Dashboard",
                "Inventory",
                "Reports"));

        switch (role) {
            case "ADMIN":
                commonItems.addAll(Arrays.asList(
                        "User Management",
                        "System Settings",
                        "Vendor Management",
                        "Warehouse Management",
                        "Analytics",
                        "Audit Logs"));
                break;
            case "WAREHOUSEMANAGER":
                commonItems.addAll(Arrays.asList(
                        "Stock Management",
                        "Restock Orders",
                        "Receiving",
                        "Stock Transfers",
                        "Inventory Audit"));
                break;
            case "VENDOR":
                commonItems.addAll(Arrays.asList(
                        "Purchase Orders",
                        "Order History",
                        "Product Catalog",
                        "Delivery Schedule"));
                break;
        }

        return commonItems;
    }

    /**
     * Get inventory level card data
     * In production, this would fetch from database
     */
    public InventoryLevelCard getInventoryLevelCard() {
        // Sample data - In production, fetch from inventory repository
        return InventoryLevelCard.builder()
                .title("Inventory Level")
                .totalItems(1250)
                .inStock(1050)
                .lowStock(150)
                .outOfStock(50)
                .stockHealthPercentage(84.0)
                .build();
    }

    /**
     * Get low stock alerts card data
     */
    public LowStockAlertCard getLowStockAlertCard() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

        List<LowStockAlertCard.AlertItem> alerts = Arrays.asList(
                LowStockAlertCard.AlertItem.builder()
                        .productName("Wireless Mouse")
                        .productCode("WM-001")
                        .currentStock(5)
                        .minimumStock(20)
                        .severity("CRITICAL")
                        .timestamp(LocalDateTime.now().minusHours(2).format(formatter))
                        .build(),
                LowStockAlertCard.AlertItem.builder()
                        .productName("USB-C Cable")
                        .productCode("UC-003")
                        .currentStock(15)
                        .minimumStock(25)
                        .severity("WARNING")
                        .timestamp(LocalDateTime.now().minusHours(5).format(formatter))
                        .build(),
                LowStockAlertCard.AlertItem.builder()
                        .productName("Laptop Stand")
                        .productCode("LS-007")
                        .currentStock(3)
                        .minimumStock(15)
                        .severity("CRITICAL")
                        .timestamp(LocalDateTime.now().minusMinutes(30).format(formatter))
                        .build());

        return LowStockAlertCard.builder()
                .title("Low Stock Alerts")
                .totalAlerts(12)
                .criticalAlerts(5)
                .warningAlerts(7)
                .recentAlerts(alerts)
                .build();
    }

    /**
     * Get auto-restock status card data
     */
    public AutoRestockStatusCard getAutoRestockStatusCard() {
        List<AutoRestockStatusCard.RestockOrder> orders = Arrays.asList(
                AutoRestockStatusCard.RestockOrder.builder()
                        .orderId("RST-2024-001")
                        .productName("Wireless Mouse")
                        .quantity(100)
                        .status("ORDERED")
                        .vendorName("TechSupplies Inc.")
                        .estimatedDelivery("2024-12-06")
                        .build(),
                AutoRestockStatusCard.RestockOrder.builder()
                        .orderId("RST-2024-002")
                        .productName("USB-C Cable")
                        .quantity(200)
                        .status("PENDING")
                        .vendorName("CableWorld Ltd.")
                        .estimatedDelivery("2024-12-07")
                        .build(),
                AutoRestockStatusCard.RestockOrder.builder()
                        .orderId("RST-2024-003")
                        .productName("Laptop Stand")
                        .quantity(50)
                        .status("APPROVED")
                        .vendorName("OfficePro Corp.")
                        .estimatedDelivery("2024-12-08")
                        .build());

        return AutoRestockStatusCard.builder()
                .title("Auto-Restock Status")
                .autoRestockEnabled(true)
                .pendingOrders(8)
                .completedToday(3)
                .scheduledOrders(5)
                .recentOrders(orders)
                .build();
    }

    /**
     * Get users summary for admin dashboard
     */
    public Map<String, Object> getUsersSummary() {
        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUsers", 25);
        summary.put("activeUsers", 22);
        summary.put("adminCount", 2);
        summary.put("warehouseManagerCount", 8);
        summary.put("vendorCount", 15);
        summary.put("recentlyAdded", 3);
        return summary;
    }

    /**
     * Get warehouse overview for warehouse managers
     */
    public Map<String, Object> getWarehouseOverview() {
        Map<String, Object> overview = new HashMap<>();
        overview.put("totalCapacity", 10000);
        overview.put("usedCapacity", 7500);
        overview.put("availableCapacity", 2500);
        overview.put("utilizationPercentage", 75.0);
        overview.put("pendingReceiving", 12);
        overview.put("pendingShipments", 8);
        overview.put("scheduledAudits", 2);
        return overview;
    }

    /**
     * Get vendor pending orders
     */
    public Map<String, Object> getVendorPendingOrders(Authentication authentication) {
        Map<String, Object> orders = new HashMap<>();
        orders.put("vendorName", authentication.getName());
        orders.put("pendingOrders", 5);
        orders.put("totalOrderValue", 15000.00);
        orders.put("ordersThisMonth", 12);
        orders.put("averageDeliveryDays", 3);
        return orders;
    }
}
