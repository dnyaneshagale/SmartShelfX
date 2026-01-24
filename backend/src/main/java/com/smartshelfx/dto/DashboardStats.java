package com.smartshelfx.dto;

import com.smartshelfx.model.Product;
import com.smartshelfx.model.PurchaseOrder;
import java.util.List;

public class DashboardStats {
    private Long totalProducts;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Long pendingPurchaseOrders;
    private Long approvedPurchaseOrders;
    private Long rejectedPurchaseOrders;
    private Long totalVendors;
    private Long totalUsers;
    private List<Product> reorderProducts;
    private List<PurchaseOrder> recentPurchaseOrders;
    
    public DashboardStats() {}
    
    public DashboardStats(Long totalProducts, Long lowStockCount, Long outOfStockCount, Long pendingPurchaseOrders, 
                         Long approvedPurchaseOrders, Long rejectedPurchaseOrders, Long totalVendors, Long totalUsers,
                         List<Product> reorderProducts, List<PurchaseOrder> recentPurchaseOrders) {
        this.totalProducts = totalProducts;
        this.lowStockCount = lowStockCount;
        this.outOfStockCount = outOfStockCount;
        this.pendingPurchaseOrders = pendingPurchaseOrders;
        this.approvedPurchaseOrders = approvedPurchaseOrders;
        this.rejectedPurchaseOrders = rejectedPurchaseOrders;
        this.totalVendors = totalVendors;
        this.totalUsers = totalUsers;
        this.reorderProducts = reorderProducts;
        this.recentPurchaseOrders = recentPurchaseOrders;
    }
    
    public Long getTotalProducts() {
        return totalProducts;
    }
    
    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }
    
    public Long getLowStockCount() {
        return lowStockCount;
    }
    
    public void setLowStockCount(Long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }
    
    public Long getPendingPurchaseOrders() {
        return pendingPurchaseOrders;
    }
    
    public void setPendingPurchaseOrders(Long pendingPurchaseOrders) {
        this.pendingPurchaseOrders = pendingPurchaseOrders;
    }
    
    public Long getTotalVendors() {
        return totalVendors;
    }
    
    public void setTotalVendors(Long totalVendors) {
        this.totalVendors = totalVendors;
    }
    
    public Long getTotalUsers() {
        return totalUsers;
    }
    
    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }
    
    public Long getOutOfStockCount() {
        return outOfStockCount;
    }
    
    public void setOutOfStockCount(Long outOfStockCount) {
        this.outOfStockCount = outOfStockCount;
    }
    
    public List<Product> getReorderProducts() {
        return reorderProducts;
    }
    
    public void setReorderProducts(List<Product> reorderProducts) {
        this.reorderProducts = reorderProducts;
    }
    
    public Long getApprovedPurchaseOrders() {
        return approvedPurchaseOrders;
    }
    
    public void setApprovedPurchaseOrders(Long approvedPurchaseOrders) {
        this.approvedPurchaseOrders = approvedPurchaseOrders;
    }
    
    public Long getRejectedPurchaseOrders() {
        return rejectedPurchaseOrders;
    }
    
    public void setRejectedPurchaseOrders(Long rejectedPurchaseOrders) {
        this.rejectedPurchaseOrders = rejectedPurchaseOrders;
    }
    
    public List<PurchaseOrder> getRecentPurchaseOrders() {
        return recentPurchaseOrders;
    }
    
    public void setRecentPurchaseOrders(List<PurchaseOrder> recentPurchaseOrders) {
        this.recentPurchaseOrders = recentPurchaseOrders;
    }
}
