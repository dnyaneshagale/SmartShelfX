package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsDTO {
    // Overview stats
    private Long totalProducts;
    private Long totalCategories;
    private Long totalVendors;
    private BigDecimal totalInventoryValue;

    // Stock health
    private Long inStockCount;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Double stockHealthPercentage;

    // Sales stats
    private BigDecimal totalSalesAmount;
    private Integer totalSalesQuantity;
    private BigDecimal averageOrderValue;

    // Purchase stats
    private BigDecimal totalPurchaseAmount;
    private Integer totalPurchaseOrders;
    private Long pendingPurchaseOrders;

    // Trends data
    private List<TrendDataPoint> salesTrend;
    private List<TrendDataPoint> purchaseTrend;
    private List<TrendDataPoint> inventoryTrend;

    // Top items
    private List<TopItemDTO> topSellingProducts;
    private List<TopItemDTO> topRestockedProducts;
    private List<TopItemDTO> topVendorsByVolume;

    // Category distribution
    private Map<String, Long> stockByCategory;
    private Map<String, BigDecimal> valueByCategory;

    // Alerts summary
    private Integer lowStockAlerts;
    private Integer expiryAlerts;
    private Integer pendingReorders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private LocalDate date;
        private String label;
        private BigDecimal value;
        private Integer quantity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopItemDTO {
        private Long id;
        private String name;
        private String sku;
        private Integer quantity;
        private BigDecimal value;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InventoryTrend {
        private LocalDate date;
        private Long productId;
        private String productName;
        private Integer quantity;
        private BigDecimal value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SalesComparison {
        private BigDecimal period1Total;
        private BigDecimal period2Total;
        private Integer period1Quantity;
        private Integer period2Quantity;
        private Double percentageChange;
        private List<TrendDataPoint> period1Trend;
        private List<TrendDataPoint> period2Trend;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopRestockedItem {
        private Long productId;
        private String productName;
        private String sku;
        private Integer restockCount;
        private Integer totalQuantityRestocked;
        private BigDecimal totalValue;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDistribution {
        private Long categoryId;
        private String categoryName;
        private Long productCount;
        private Long totalQuantity;
        private BigDecimal totalValue;
        private Double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VendorPerformance {
        private Long vendorId;
        private String vendorName;
        private Long productCount;
        private Integer totalOrders;
        private BigDecimal totalOrderValue;
        private Double fulfillmentRate;
        private Double averageDeliveryDays;
    }
}
