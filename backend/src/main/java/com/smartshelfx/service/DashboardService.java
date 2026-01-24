package com.smartshelfx.service;

import com.smartshelfx.dto.DashboardStats;
import com.smartshelfx.model.PurchaseOrder;
import com.smartshelfx.model.Role;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.ProductRepository;
import com.smartshelfx.repository.PurchaseOrderRepository;
import com.smartshelfx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private PurchaseOrderRepository purchaseOrderRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public DashboardStats getStats() {
        Long totalProducts = productRepository.count();
        Long lowStockCount = productRepository.countLowStockProducts();
        Long outOfStockCount = productRepository.countOutOfStockProducts();
        Long pendingPOs = (long) purchaseOrderRepository.findByStatus(PurchaseOrder.Status.PENDING).size();
        Long approvedPOs = (long) purchaseOrderRepository.findByStatus(PurchaseOrder.Status.APPROVED).size();
        Long rejectedPOs = (long) purchaseOrderRepository.findByStatus(PurchaseOrder.Status.REJECTED).size();
        Long totalVendors = (long) userRepository.findByRole(Role.VENDOR).size();
        Long totalUsers = userRepository.count();
        
        // Get products that need reordering (both low stock and out of stock)
        java.util.List<com.smartshelfx.model.Product> reorderProducts = new java.util.ArrayList<>();
        reorderProducts.addAll(productRepository.findOutOfStockProducts());
        reorderProducts.addAll(productRepository.findLowStockProducts());
        
        // Get recent purchase orders (last 10)
        java.util.List<PurchaseOrder> allPOs = purchaseOrderRepository.findAll();
        java.util.List<PurchaseOrder> recentPOs = allPOs.stream()
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .limit(10)
            .collect(java.util.stream.Collectors.toList());
        
        return new DashboardStats(totalProducts, lowStockCount, outOfStockCount, pendingPOs, 
                                 approvedPOs, rejectedPOs, totalVendors, totalUsers, reorderProducts, recentPOs);
    }
}
