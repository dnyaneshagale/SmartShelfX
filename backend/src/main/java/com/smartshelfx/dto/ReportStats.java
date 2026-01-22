package com.smartshelfx.dto;

import java.util.List;
import java.util.Map;

public class ReportStats {
    private Double totalRevenue;
    private Long totalOrders;
    private Double stockTurnover;
    private Double orderFulfillmentRate;
    private Map<String, Long> categoryStock;
    private List<LowStockAlert> lowStockAlerts;
    private List<VendorPerformance> vendorPerformance;
    private OrderStats orderStats;
    
    // Nested classes for structured data
    public static class LowStockAlert {
        private String productName;
        private Integer currentStock;
        private Integer reorderLevel;
        
        public LowStockAlert(String productName, Integer currentStock, Integer reorderLevel) {
            this.productName = productName;
            this.currentStock = currentStock;
            this.reorderLevel = reorderLevel;
        }
        
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Integer getCurrentStock() { return currentStock; }
        public void setCurrentStock(Integer currentStock) { this.currentStock = currentStock; }
        public Integer getReorderLevel() { return reorderLevel; }
        public void setReorderLevel(Integer reorderLevel) { this.reorderLevel = reorderLevel; }
    }
    
    public static class VendorPerformance {
        private String name;
        private Long products;
        private Long orders;
        private Double fulfillmentRate;
        private String avgResponseTime;
        private Integer rating;
        
        public VendorPerformance(String name, Long products, Long orders, Double fulfillmentRate, String avgResponseTime, Integer rating) {
            this.name = name;
            this.products = products;
            this.orders = orders;
            this.fulfillmentRate = fulfillmentRate;
            this.avgResponseTime = avgResponseTime;
            this.rating = rating;
        }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public Long getProducts() { return products; }
        public void setProducts(Long products) { this.products = products; }
        public Long getOrders() { return orders; }
        public void setOrders(Long orders) { this.orders = orders; }
        public Double getFulfillmentRate() { return fulfillmentRate; }
        public void setFulfillmentRate(Double fulfillmentRate) { this.fulfillmentRate = fulfillmentRate; }
        public String getAvgResponseTime() { return avgResponseTime; }
        public void setAvgResponseTime(String avgResponseTime) { this.avgResponseTime = avgResponseTime; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
    }
    
    public static class OrderStats {
        private Long total;
        private Long pending;
        private Long approved;
        private Long rejected;
        
        public OrderStats(Long total, Long pending, Long approved, Long rejected) {
            this.total = total;
            this.pending = pending;
            this.approved = approved;
            this.rejected = rejected;
        }
        
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }
        public Long getPending() { return pending; }
        public void setPending(Long pending) { this.pending = pending; }
        public Long getApproved() { return approved; }
        public void setApproved(Long approved) { this.approved = approved; }
        public Long getRejected() { return rejected; }
        public void setRejected(Long rejected) { this.rejected = rejected; }
    }
    
    // Getters and Setters
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public Double getStockTurnover() { return stockTurnover; }
    public void setStockTurnover(Double stockTurnover) { this.stockTurnover = stockTurnover; }
    public Double getOrderFulfillmentRate() { return orderFulfillmentRate; }
    public void setOrderFulfillmentRate(Double orderFulfillmentRate) { this.orderFulfillmentRate = orderFulfillmentRate; }
    public Map<String, Long> getCategoryStock() { return categoryStock; }
    public void setCategoryStock(Map<String, Long> categoryStock) { this.categoryStock = categoryStock; }
    public List<LowStockAlert> getLowStockAlerts() { return lowStockAlerts; }
    public void setLowStockAlerts(List<LowStockAlert> lowStockAlerts) { this.lowStockAlerts = lowStockAlerts; }
    public List<VendorPerformance> getVendorPerformance() { return vendorPerformance; }
    public void setVendorPerformance(List<VendorPerformance> vendorPerformance) { this.vendorPerformance = vendorPerformance; }
    public OrderStats getOrderStats() { return orderStats; }
    public void setOrderStats(OrderStats orderStats) { this.orderStats = orderStats; }
}
