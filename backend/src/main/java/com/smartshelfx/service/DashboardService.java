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
        Long pendingPOs = (long) purchaseOrderRepository.findByStatus(PurchaseOrder.Status.PENDING).size();
        Long totalVendors = (long) userRepository.findByRole(Role.VENDOR).size();
        
        return new DashboardStats(totalProducts, lowStockCount, pendingPOs, totalVendors);
    }
}
