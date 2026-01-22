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
        
        // Stock Turnover (simplified: total out / average stock)
        long totalProducts = productRepository.count();
        long totalStockValue = productRepository.findAll().stream()
            .mapToLong(p -> p.getCurrentStock() != null ? p.getCurrentStock() : 0)
            .sum();
        
        long totalOutTransactions = stockTransactionRepository.findAll().stream()
            .filter(t -> "OUT".equals(t.getTransactionType()))
            .mapToLong(t -> t.getQuantity() != null ? t.getQuantity() : 0)
            .sum();
        
        double avgStock = totalStockValue > 0 ? (double) totalStockValue / totalProducts : 1;
        double stockTurnover = avgStock > 0 ? totalOutTransactions / avgStock : 0;
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
                long ordersCount = allOrders.stream()
                    .filter(po -> po.getVendor() != null && po.getVendor().getId().equals(vendor.getId()))
                    .count();
                
                long approvedOrders = allOrders.stream()
                    .filter(po -> po.getVendor() != null && po.getVendor().getId().equals(vendor.getId()))
                    .filter(po -> PurchaseOrder.Status.APPROVED.equals(po.getStatus()))
                    .count();
                
                double vendorFulfillmentRate = ordersCount > 0 ? (double) approvedOrders / ordersCount * 100 : 0;
                
                // Random avg response time and rating for demo (can be calculated from real data)
                String avgResponseTime = String.format("%.1f days", 2.0 + Math.random() * 3);
                int rating = ordersCount > 10 ? (vendorFulfillmentRate > 90 ? 5 : 4) : 3;
                
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
