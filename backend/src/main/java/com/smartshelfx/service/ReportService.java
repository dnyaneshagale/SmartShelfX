package com.smartshelfx.service;

import com.smartshelfx.dto.ReportStats;
import com.smartshelfx.model.Product;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.model.Role;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.PurchaseOrderRepository;
import com.smartshelfx.repository.StockTransactionRepository;
import com.smartshelfx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private StockTransactionRepository stockTransactionRepository;
    
    public ReportStats generateReportStats() {
        ReportStats stats = new ReportStats();
        
        // Calculate Total Revenue (sum of all purchase orders)
        List<PurchaseOrder> allOrders = purchaseOrderRepository.findAll();
        double totalRevenue = allOrders.stream()
            .filter(po -> po.getTotalCost() != null)
            .mapToDouble(po -> po.getTotalCost().doubleValue())
            .sum();
        stats.setTotalRevenue(totalRevenue);
        
        // Total Orders
        stats.setTotalOrders((long) allOrders.size());
        
        // Stock Turnover Calculation
        // Formula: Cost of Goods Sold (COGS) / Average Inventory Value
        // COGS = Total value of approved purchase orders (represents goods sold/used)
        double cogs = allOrders.stream()
            .filter(po -> PurchaseOrder.Status.APPROVED.equals(po.getStatus()))
            .filter(po -> po.getTotalCost() != null)
            .mapToDouble(po -> po.getTotalCost().doubleValue())
            .sum();
        
        // Average Inventory Value = Total value of current stock
        double avgInventoryValue = productRepository.findAll().stream()
            .filter(p -> p.getCurrentStock() != null && p.getPrice() != null)
            .mapToDouble(p -> p.getCurrentStock() * p.getPrice().doubleValue())
            .sum();
        
        // Calculate turnover ratio
        double stockTurnover = 0;
        if (avgInventoryValue > 0 && cogs > 0) {
            stockTurnover = cogs / avgInventoryValue;
        }
        stats.setStockTurnover(Math.round(stockTurnover * 10.0) / 10.0);
        
        // Order Fulfillment Rate (approved orders / total orders)
        long approvedCount = allOrders.stream()
            .filter(po -> PurchaseOrder.Status.APPROVED.equals(po.getStatus()))
            .count();
        double fulfillmentRate = allOrders.size() > 0 ? (double) approvedCount / allOrders.size() * 100 : 0;
        stats.setOrderFulfillmentRate(Math.round(fulfillmentRate * 10.0) / 10.0);
        
        // Category Stock Distribution
        Map<String, Long> categoryStock = productRepository.findAll().stream()
            .collect(Collectors.groupingBy(
                p -> p.getCategory() != null ? p.getCategory() : "Uncategorized",
                Collectors.summingLong(p -> p.getCurrentStock() != null ? p.getCurrentStock() : 0)
            ));
        stats.setCategoryStock(categoryStock);
        
        // Low Stock Alerts
        List<ReportStats.LowStockAlert> lowStockAlerts = productRepository.findAll().stream()
            .filter(p -> p.getCurrentStock() != null && p.getReorderLevel() != null)
            .filter(p -> p.getCurrentStock() < p.getReorderLevel())
            .map(p -> new ReportStats.LowStockAlert(
                p.getName(),
                p.getCurrentStock(),
                p.getReorderLevel()
            ))
            .collect(Collectors.toList());
        stats.setLowStockAlerts(lowStockAlerts);
        
        // Vendor Performance
        List<User> vendors = userRepository.findByRole(Role.VENDOR);
        List<ReportStats.VendorPerformance> vendorPerformance = vendors.stream()
            .map(vendor -> {
                long productsCount = productRepository.findByVendorId(vendor.getId()).size();
                
                // Get all orders for this vendor
                List<PurchaseOrder> vendorOrders = allOrders.stream()
                    .filter(po -> po.getVendor() != null && po.getVendor().getId().equals(vendor.getId()))
                    .collect(Collectors.toList());
                
                long ordersCount = vendorOrders.size();
                
                long approvedOrders = vendorOrders.stream()
                    .filter(po -> PurchaseOrder.Status.APPROVED.equals(po.getStatus()))
                    .count();
                
                double vendorFulfillmentRate = ordersCount > 0 ? (double) approvedOrders / ordersCount * 100 : 0;
                
                // Calculate actual average response time (time from creation to approval)
                double avgResponseDays = 0;
                List<PurchaseOrder> approvedOrdersList = vendorOrders.stream()
                    .filter(po -> PurchaseOrder.Status.APPROVED.equals(po.getStatus()))
                    .filter(po -> po.getCreatedAt() != null && po.getApprovedAt() != null)
                    .collect(Collectors.toList());
                
                if (!approvedOrdersList.isEmpty()) {
                    long totalHours = approvedOrdersList.stream()
                        .mapToLong(po -> java.time.Duration.between(po.getCreatedAt(), po.getApprovedAt()).toHours())
                        .sum();
                    avgResponseDays = (double) totalHours / approvedOrdersList.size() / 24.0;
                }
                
                String avgResponseTime = approvedOrdersList.isEmpty() 
                    ? "N/A" 
                    : String.format("%.1f days", avgResponseDays);
                
                // Calculate rating based on fulfillment rate and response time
                // 5 stars: >95% fulfillment + <2 days response
                // 4 stars: >80% fulfillment + <4 days response
                // 3 stars: >60% fulfillment or <6 days response
                // 2 stars: >40% fulfillment
                // 1 star: everything else
                int rating = 1;
                if (ordersCount > 0) {
                    if (vendorFulfillmentRate >= 95 && avgResponseDays > 0 && avgResponseDays < 2) {
                        rating = 5;
                    } else if (vendorFulfillmentRate >= 80 && avgResponseDays > 0 && avgResponseDays < 4) {
                        rating = 4;
                    } else if (vendorFulfillmentRate >= 60 || (avgResponseDays > 0 && avgResponseDays < 6)) {
                        rating = 3;
                    } else if (vendorFulfillmentRate >= 40) {
                        rating = 2;
                    }
                }
                
                return new ReportStats.VendorPerformance(
                    vendor.getFullName(),
                    productsCount,
                    ordersCount,
                    Math.round(vendorFulfillmentRate * 10.0) / 10.0,
                    avgResponseTime,
                    rating
                );
            })
            .filter(vp -> vp.getOrders() > 0) // Only include vendors with orders
            .collect(Collectors.toList());
        stats.setVendorPerformance(vendorPerformance);
        
        // Order Stats
        long pendingCount = allOrders.stream()
            .filter(po -> PurchaseOrder.Status.PENDING.equals(po.getStatus()))
            .count();
        long rejectedCount = allOrders.stream()
            .filter(po -> PurchaseOrder.Status.REJECTED.equals(po.getStatus()))
            .count();
        
        ReportStats.OrderStats orderStats = new ReportStats.OrderStats(
            (long) allOrders.size(),
            pendingCount,
            approvedCount,
            rejectedCount
        );
        stats.setOrderStats(orderStats);
        
        return stats;
    }
}
