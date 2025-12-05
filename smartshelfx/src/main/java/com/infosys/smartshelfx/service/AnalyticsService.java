package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Analytics Service
 * - Inventory trends
 * - Monthly purchase/sales comparison
 * - Top restocked items
 * - Export as Excel/PDF data preparation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SalesHistoryRepository salesHistoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ReorderRequestRepository reorderRequestRepository;
    private final DemandForecastRepository demandForecastRepository;
    private final ProductExpiryRepository productExpiryRepository;

    /**
     * Get comprehensive analytics dashboard data
     */
    public AnalyticsDTO getAnalyticsDashboard(LocalDate startDate, LocalDate endDate) {
        if (startDate == null)
            startDate = LocalDate.now().minusMonths(1);
        if (endDate == null)
            endDate = LocalDate.now();

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        // Overview stats
        Long totalProducts = productRepository.count();
        Long totalCategories = categoryRepository.count();
        Long totalVendors = userRepository.countByRole(Role.VENDOR);
        BigDecimal totalInventoryValue = calculateTotalInventoryValue();

        // Stock health
        Long inStockCount = productRepository.countByStockStatus(StockStatus.IN_STOCK);
        Long lowStockCount = productRepository.countByStockStatus(StockStatus.LOW_STOCK);
        Long outOfStockCount = productRepository.countByStockStatus(StockStatus.OUT_OF_STOCK);
        double stockHealthPercentage = totalProducts > 0
                ? (inStockCount.doubleValue() / totalProducts.doubleValue()) * 100
                : 0;

        // Sales stats
        BigDecimal totalSalesAmount = salesHistoryRepository.getTotalSalesAmount(startDate, endDate);
        Integer totalSalesQuantity = getTotalSalesQuantity(startDate, endDate);
        BigDecimal averageOrderValue = totalSalesQuantity != null && totalSalesQuantity > 0 && totalSalesAmount != null
                ? totalSalesAmount.divide(BigDecimal.valueOf(totalSalesQuantity), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Purchase stats
        BigDecimal totalPurchaseAmount = purchaseOrderRepository.getTotalPurchaseAmount(
                List.of(PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.RECEIVED),
                startDateTime, endDateTime);
        Long pendingPurchaseOrders = purchaseOrderRepository.countByStatus(PurchaseOrderStatus.PENDING);
        int totalPurchaseOrders = (int) purchaseOrderRepository.count();

        // Trends
        List<AnalyticsDTO.TrendDataPoint> salesTrend = getSalesTrend(startDate, endDate);
        List<AnalyticsDTO.TrendDataPoint> purchaseTrend = getPurchaseTrend(startDate, endDate);
        List<AnalyticsDTO.TrendDataPoint> inventoryTrend = getInventoryTrend(startDate, endDate);

        // Top items
        List<AnalyticsDTO.TopItemDTO> topSellingProducts = getTopSellingProducts(startDate, endDate, 10);
        List<AnalyticsDTO.TopItemDTO> topRestockedProducts = getTopRestockedProducts(startDate, endDate, 10);
        List<AnalyticsDTO.TopItemDTO> topVendorsByVolume = getTopVendorsByVolume(startDate, endDate, 10);

        // Category distribution
        Map<String, Long> stockByCategory = getStockByCategory();
        Map<String, BigDecimal> valueByCategory = getValueByCategory();

        // Alerts summary
        Integer lowStockAlerts = lowStockCount.intValue();
        Integer expiryAlerts = getExpiryAlertCount();
        Integer pendingReorders = reorderRequestRepository.countByStatus(ReorderStatus.PENDING).intValue();

        return AnalyticsDTO.builder()
                .totalProducts(totalProducts)
                .totalCategories(totalCategories)
                .totalVendors(totalVendors)
                .totalInventoryValue(totalInventoryValue)
                .inStockCount(inStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .stockHealthPercentage(stockHealthPercentage)
                .totalSalesAmount(totalSalesAmount != null ? totalSalesAmount : BigDecimal.ZERO)
                .totalSalesQuantity(totalSalesQuantity != null ? totalSalesQuantity : 0)
                .averageOrderValue(averageOrderValue)
                .totalPurchaseAmount(totalPurchaseAmount != null ? totalPurchaseAmount : BigDecimal.ZERO)
                .totalPurchaseOrders(totalPurchaseOrders)
                .pendingPurchaseOrders(pendingPurchaseOrders)
                .salesTrend(salesTrend)
                .purchaseTrend(purchaseTrend)
                .inventoryTrend(inventoryTrend)
                .topSellingProducts(topSellingProducts)
                .topRestockedProducts(topRestockedProducts)
                .topVendorsByVolume(topVendorsByVolume)
                .stockByCategory(stockByCategory)
                .valueByCategory(valueByCategory)
                .lowStockAlerts(lowStockAlerts)
                .expiryAlerts(expiryAlerts)
                .pendingReorders(pendingReorders)
                .build();
    }

    /**
     * Get inventory trends over time
     */
    public List<AnalyticsDTO.TrendDataPoint> getInventoryTrend(LocalDate startDate, LocalDate endDate) {
        List<AnalyticsDTO.TrendDataPoint> trend = new ArrayList<>();

        // Get stock movements in date range
        List<StockMovement> movements = stockMovementRepository.findByDateRange(
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        // Group by date
        Map<LocalDate, List<StockMovement>> byDate = movements.stream()
                .collect(Collectors.groupingBy(m -> m.getCreatedAt().toLocalDate()));

        // Calculate running stock levels
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<StockMovement> dayMovements = byDate.getOrDefault(date, List.of());

            int inbound = dayMovements.stream()
                    .filter(m -> isInboundMovement(m.getMovementType()))
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            int outbound = dayMovements.stream()
                    .filter(m -> !isInboundMovement(m.getMovementType()))
                    .mapToInt(StockMovement::getQuantity)
                    .sum();

            trend.add(AnalyticsDTO.TrendDataPoint.builder()
                    .date(date)
                    .label(date.format(DateTimeFormatter.ofPattern("MMM dd")))
                    .value(BigDecimal.valueOf(inbound - outbound))
                    .quantity(inbound - outbound)
                    .build());
        }

        return trend;
    }

    /**
     * Get sales trend over time
     */
    public List<AnalyticsDTO.TrendDataPoint> getSalesTrend(LocalDate startDate, LocalDate endDate) {
        List<Object[]> dailySales = salesHistoryRepository.getDailySalesSummary(startDate, endDate);
        List<AnalyticsDTO.TrendDataPoint> trend = new ArrayList<>();

        for (Object[] row : dailySales) {
            LocalDate date = (LocalDate) row[0];
            Long quantity = (Long) row[1];
            BigDecimal value = (BigDecimal) row[2];

            trend.add(AnalyticsDTO.TrendDataPoint.builder()
                    .date(date)
                    .label(date.format(DateTimeFormatter.ofPattern("MMM dd")))
                    .value(value != null ? value : BigDecimal.ZERO)
                    .quantity(quantity != null ? quantity.intValue() : 0)
                    .build());
        }

        return trend;
    }

    /**
     * Get purchase trend over time
     */
    public List<AnalyticsDTO.TrendDataPoint> getPurchaseTrend(LocalDate startDate, LocalDate endDate) {
        List<AnalyticsDTO.TrendDataPoint> trend = new ArrayList<>();

        List<PurchaseOrder> orders = purchaseOrderRepository.findByDateRange(
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        // Group by date
        Map<LocalDate, List<PurchaseOrder>> byDate = orders.stream()
                .collect(Collectors.groupingBy(po -> po.getCreatedAt().toLocalDate()));

        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            List<PurchaseOrder> dayOrders = byDate.getOrDefault(date, List.of());

            BigDecimal totalValue = dayOrders.stream()
                    .map(PurchaseOrder::getGrandTotal)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            trend.add(AnalyticsDTO.TrendDataPoint.builder()
                    .date(date)
                    .label(date.format(DateTimeFormatter.ofPattern("MMM dd")))
                    .value(totalValue)
                    .quantity(dayOrders.size())
                    .build());
        }

        return trend;
    }

    /**
     * Get top selling products
     */
    public List<AnalyticsDTO.TopItemDTO> getTopSellingProducts(LocalDate startDate, LocalDate endDate, int limit) {
        List<Object[]> topProducts = salesHistoryRepository.getTopSellingProducts(
                startDate, endDate, PageRequest.of(0, limit));

        return topProducts.stream()
                .map(row -> AnalyticsDTO.TopItemDTO.builder()
                        .id((Long) row[0])
                        .name((String) row[1])
                        .quantity(((Long) row[2]).intValue())
                        .build())
                .toList();
    }

    /**
     * Get top restocked products
     */
    public List<AnalyticsDTO.TopItemDTO> getTopRestockedProducts(LocalDate startDate, LocalDate endDate, int limit) {
        List<StockMovement> movements = stockMovementRepository.findByDateRange(
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        // Group by product and sum receiving quantities
        Map<Long, Integer> productRestock = movements.stream()
                .filter(m -> m.getMovementType() == MovementType.RECEIVING ||
                        m.getMovementType() == MovementType.RESTOCK)
                .collect(Collectors.groupingBy(
                        m -> m.getProduct().getId(),
                        Collectors.summingInt(StockMovement::getQuantity)));

        return productRestock.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(entry -> {
                    Product product = productRepository.findById(entry.getKey()).orElse(null);
                    return AnalyticsDTO.TopItemDTO.builder()
                            .id(entry.getKey())
                            .name(product != null ? product.getName() : "Unknown")
                            .sku(product != null ? product.getSku() : "")
                            .quantity(entry.getValue())
                            .build();
                })
                .toList();
    }

    /**
     * Get top vendors by sales volume
     */
    public List<AnalyticsDTO.TopItemDTO> getTopVendorsByVolume(LocalDate startDate, LocalDate endDate, int limit) {
        List<Object[]> vendorSales = salesHistoryRepository.getSalesByVendor(startDate, endDate);

        return vendorSales.stream()
                .sorted((a, b) -> ((BigDecimal) b[2]).compareTo((BigDecimal) a[2]))
                .limit(limit)
                .map(row -> AnalyticsDTO.TopItemDTO.builder()
                        .id((Long) row[0])
                        .name((String) row[1])
                        .value((BigDecimal) row[2])
                        .build())
                .toList();
    }

    /**
     * Get stock distribution by category
     */
    public Map<String, Long> getStockByCategory() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.summingLong(Product::getCurrentStock)));
    }

    /**
     * Get inventory value by category
     */
    public Map<String, BigDecimal> getValueByCategory() {
        List<Product> products = productRepository.findAll();

        return products.stream()
                .filter(p -> p.getUnitPrice() != null)
                .collect(Collectors.groupingBy(
                        p -> p.getCategory().getName(),
                        Collectors.reducing(
                                BigDecimal.ZERO,
                                p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())),
                                BigDecimal::add)));
    }

    /**
     * Get monthly comparison data
     */
    public Map<String, Object> getMonthlyComparison(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);

        LocalDate prevStartDate = startDate.minusMonths(1);
        LocalDate prevEndDate = prevStartDate.plusMonths(1).minusDays(1);

        // Current month
        BigDecimal currentSales = salesHistoryRepository.getTotalSalesAmount(startDate, endDate);
        BigDecimal prevSales = salesHistoryRepository.getTotalSalesAmount(prevStartDate, prevEndDate);

        BigDecimal currentPurchases = purchaseOrderRepository.getTotalPurchaseAmount(
                List.of(PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.RECEIVED),
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());
        BigDecimal prevPurchases = purchaseOrderRepository.getTotalPurchaseAmount(
                List.of(PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.RECEIVED),
                prevStartDate.atStartOfDay(), prevEndDate.plusDays(1).atStartOfDay());

        // Calculate changes
        double salesChange = calculatePercentageChange(prevSales, currentSales);
        double purchasesChange = calculatePercentageChange(prevPurchases, currentPurchases);

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("currentMonth", startDate.getMonth().toString());
        comparison.put("previousMonth", prevStartDate.getMonth().toString());
        comparison.put("currentSales", currentSales);
        comparison.put("previousSales", prevSales);
        comparison.put("salesChange", salesChange);
        comparison.put("currentPurchases", currentPurchases);
        comparison.put("previousPurchases", prevPurchases);
        comparison.put("purchasesChange", purchasesChange);

        return comparison;
    }

    /**
     * Prepare data for Excel export
     */
    public Map<String, Object> prepareExcelExportData(LocalDate startDate, LocalDate endDate) {
        Map<String, Object> data = new HashMap<>();

        // Summary
        data.put("summary", getAnalyticsDashboard(startDate, endDate));

        // Products
        data.put("products", productRepository.findAll().stream()
                .map(this::toProductExportData)
                .toList());

        // Stock movements
        data.put("stockMovements", stockMovementRepository
                .findByDateRange(startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay())
                .stream()
                .map(this::toMovementExportData)
                .toList());

        // Sales
        data.put("sales", salesHistoryRepository
                .findByProductIdAndDateRange(null, startDate, endDate)
                .stream()
                .map(this::toSalesExportData)
                .toList());

        return data;
    }

    // Helper methods

    private BigDecimal calculateTotalInventoryValue() {
        return productRepository.findAll().stream()
                .filter(p -> p.getUnitPrice() != null)
                .map(p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Integer getTotalSalesQuantity(LocalDate startDate, LocalDate endDate) {
        return salesHistoryRepository.findAll().stream()
                .filter(s -> !s.getSaleDate().isBefore(startDate) && !s.getSaleDate().isAfter(endDate))
                .mapToInt(SalesHistory::getQuantity)
                .sum();
    }

    private Integer getExpiryAlertCount() {
        LocalDate alertDate = LocalDate.now().plusDays(30);
        return productExpiryRepository.findItemsNearingExpiry(LocalDate.now(), alertDate).size();
    }

    private boolean isInboundMovement(MovementType type) {
        return type == MovementType.RECEIVING ||
                type == MovementType.RETURN ||
                type == MovementType.TRANSFER_IN ||
                type == MovementType.RESTOCK;
    }

    private double calculatePercentageChange(BigDecimal previous, BigDecimal current) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return current != null && current.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }
        if (current == null)
            current = BigDecimal.ZERO;
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .doubleValue();
    }

    private Map<String, Object> toProductExportData(Product p) {
        Map<String, Object> data = new HashMap<>();
        data.put("sku", p.getSku());
        data.put("name", p.getName());
        data.put("category", p.getCategory().getName());
        data.put("vendor", p.getVendor().getUsername());
        data.put("currentStock", p.getCurrentStock());
        data.put("reorderLevel", p.getReorderLevel());
        data.put("unitPrice", p.getUnitPrice());
        data.put("stockStatus", p.getStockStatus());
        return data;
    }

    private Map<String, Object> toMovementExportData(StockMovement m) {
        Map<String, Object> data = new HashMap<>();
        data.put("date", m.getCreatedAt());
        data.put("productSku", m.getProduct().getSku());
        data.put("productName", m.getProduct().getName());
        data.put("type", m.getMovementType());
        data.put("quantity", m.getQuantity());
        data.put("previousStock", m.getPreviousStock());
        data.put("newStock", m.getNewStock());
        data.put("handler", m.getPerformedBy() != null ? m.getPerformedBy().getUsername() : "");
        return data;
    }

    private Map<String, Object> toSalesExportData(SalesHistory s) {
        Map<String, Object> data = new HashMap<>();
        data.put("date", s.getSaleDate());
        data.put("productSku", s.getProduct().getSku());
        data.put("productName", s.getProduct().getName());
        data.put("quantity", s.getQuantity());
        data.put("unitPrice", s.getUnitPrice());
        data.put("totalAmount", s.getTotalAmount());
        data.put("orderReference", s.getOrderReference());
        return data;
    }

    /**
     * Get inventory trends for analytics controller
     */
    public List<AnalyticsDTO.InventoryTrend> getInventoryTrends(Long productId, Long categoryId, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now();

        List<AnalyticsDTO.InventoryTrend> trends = new ArrayList<>();
        List<Product> products;

        if (productId != null) {
            products = productRepository.findById(productId).map(List::of).orElse(List.of());
        } else if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAll();
        }

        // Get stock movements for trend calculation
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();

        for (Product product : products) {
            List<StockMovement> movements = stockMovementRepository.findByProductIdAndCreatedAtBetween(
                    product.getId(), startDateTime, endDateTime);

            // Group by date
            Map<LocalDate, Integer> dailyStock = new TreeMap<>();
            int currentStock = product.getCurrentStock();

            // Work backwards from current stock
            for (LocalDate date = endDate; !date.isBefore(startDate); date = date.minusDays(1)) {
                dailyStock.put(date, currentStock);

                // Adjust for movements on this date
                LocalDate finalDate = date;
                movements.stream()
                        .filter(m -> m.getCreatedAt().toLocalDate().equals(finalDate))
                        .forEach(m -> {
                            // This is a simplification - we're showing current stock level for the day
                        });
            }

            for (Map.Entry<LocalDate, Integer> entry : dailyStock.entrySet()) {
                trends.add(AnalyticsDTO.InventoryTrend.builder()
                        .date(entry.getKey())
                        .productId(product.getId())
                        .productName(product.getName())
                        .quantity(entry.getValue())
                        .value(product.getUnitPrice() != null
                                ? product.getUnitPrice().multiply(BigDecimal.valueOf(entry.getValue()))
                                : BigDecimal.ZERO)
                        .build());
            }
        }

        return trends;
    }

    /**
     * Get sales comparison between two periods
     */
    public AnalyticsDTO.SalesComparison getSalesComparison(
            LocalDateTime start1, LocalDateTime end1,
            LocalDateTime start2, LocalDateTime end2) {

        BigDecimal period1Total = salesHistoryRepository.getTotalSalesAmount(
                start1.toLocalDate(), end1.toLocalDate());
        BigDecimal period2Total = salesHistoryRepository.getTotalSalesAmount(
                start2.toLocalDate(), end2.toLocalDate());

        Integer period1Quantity = getTotalSalesQuantity(start1.toLocalDate(), end1.toLocalDate());
        Integer period2Quantity = getTotalSalesQuantity(start2.toLocalDate(), end2.toLocalDate());

        double percentageChange = calculatePercentageChange(period1Total, period2Total);

        List<AnalyticsDTO.TrendDataPoint> period1Trend = getSalesTrend(start1.toLocalDate(), end1.toLocalDate());
        List<AnalyticsDTO.TrendDataPoint> period2Trend = getSalesTrend(start2.toLocalDate(), end2.toLocalDate());

        return AnalyticsDTO.SalesComparison.builder()
                .period1Total(period1Total != null ? period1Total : BigDecimal.ZERO)
                .period2Total(period2Total != null ? period2Total : BigDecimal.ZERO)
                .period1Quantity(period1Quantity != null ? period1Quantity : 0)
                .period2Quantity(period2Quantity != null ? period2Quantity : 0)
                .percentageChange(percentageChange)
                .period1Trend(period1Trend)
                .period2Trend(period2Trend)
                .build();
    }

    /**
     * Get top restocked items
     */
    public List<AnalyticsDTO.TopRestockedItem> getTopRestockedItems(int limit, int days) {
        LocalDate startDate = LocalDate.now().minusDays(days);
        LocalDate endDate = LocalDate.now();

        List<AnalyticsDTO.TopItemDTO> topItems = getTopRestockedProducts(startDate, endDate, limit);

        return topItems.stream()
                .map(item -> AnalyticsDTO.TopRestockedItem.builder()
                        .productId(item.getId())
                        .productName(item.getName())
                        .sku(item.getSku())
                        .restockCount(1) // Simplified
                        .totalQuantityRestocked(item.getQuantity())
                        .totalValue(item.getValue())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Get category distribution
     */
    public List<AnalyticsDTO.CategoryDistribution> getCategoryDistribution() {
        Map<String, Long> stockByCategory = getStockByCategory();
        Map<String, BigDecimal> valueByCategory = getValueByCategory();

        long totalQuantity = stockByCategory.values().stream().mapToLong(Long::longValue).sum();

        return categoryRepository.findAll().stream()
                .map(category -> {
                    Long quantity = stockByCategory.getOrDefault(category.getName(), 0L);
                    BigDecimal value = valueByCategory.getOrDefault(category.getName(), BigDecimal.ZERO);
                    long productCount = productRepository.findByCategoryId(category.getId()).size();
                    double percentage = totalQuantity > 0
                            ? (quantity.doubleValue() / totalQuantity) * 100
                            : 0;

                    return AnalyticsDTO.CategoryDistribution.builder()
                            .categoryId(category.getId())
                            .categoryName(category.getName())
                            .productCount(productCount)
                            .totalQuantity(quantity)
                            .totalValue(value)
                            .percentage(percentage)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Get stock status summary
     */
    public Map<String, Long> getStockStatusSummary() {
        Map<String, Long> summary = new HashMap<>();
        summary.put("IN_STOCK", productRepository.countByStockStatus(StockStatus.IN_STOCK));
        summary.put("LOW_STOCK", productRepository.countByStockStatus(StockStatus.LOW_STOCK));
        summary.put("OUT_OF_STOCK", productRepository.countByStockStatus(StockStatus.OUT_OF_STOCK));
        summary.put("TOTAL", productRepository.count());
        return summary;
    }

    /**
     * Get vendor performance metrics
     */
    public List<AnalyticsDTO.VendorPerformance> getVendorPerformance(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        LocalDateTime endDate = LocalDateTime.now();

        List<User> vendors = userRepository.findByRole(Role.VENDOR);

        return vendors.stream()
                .map(vendor -> {
                    Long productCount = productRepository.countByVendorId(vendor.getId());
                    List<PurchaseOrder> orders = purchaseOrderRepository.findByVendorIdAndCreatedAtBetween(
                            vendor.getId(), startDate, endDate);

                    BigDecimal totalValue = orders.stream()
                            .map(PurchaseOrder::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    long deliveredOrders = orders.stream()
                            .filter(o -> o.getStatus() == PurchaseOrderStatus.RECEIVED)
                            .count();

                    double fulfillmentRate = orders.isEmpty() ? 0
                            : (deliveredOrders * 100.0) / orders.size();

                    return AnalyticsDTO.VendorPerformance.builder()
                            .vendorId(vendor.getId())
                            .vendorName(vendor.getUsername())
                            .productCount(productCount)
                            .totalOrders(orders.size())
                            .totalOrderValue(totalValue)
                            .fulfillmentRate(fulfillmentRate)
                            .averageDeliveryDays(0.0) // Would need delivery tracking
                            .build();
                })
                .collect(Collectors.toList());
    }
}
