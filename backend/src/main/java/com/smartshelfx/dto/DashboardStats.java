package com.smartshelfx.dto;

public class DashboardStats {
    private Long totalProducts;
    private Long lowStockCount;
    private Long pendingPurchaseOrders;
    private Long totalVendors;
    
    public DashboardStats() {}
    
    public DashboardStats(Long totalProducts, Long lowStockCount, Long pendingPurchaseOrders, Long totalVendors) {
        this.totalProducts = totalProducts;
        this.lowStockCount = lowStockCount;
        this.pendingPurchaseOrders = pendingPurchaseOrders;
        this.totalVendors = totalVendors;
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
}
