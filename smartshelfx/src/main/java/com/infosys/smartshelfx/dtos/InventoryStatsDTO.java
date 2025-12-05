package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryStatsDTO {
    private Long totalProducts;
    private Long inStockCount;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Double stockHealthPercentage;
    private BigDecimal totalInventoryValue;
    private Integer pendingReorders;
    private List<ProductDTO> criticalStockProducts;
    private Map<String, Long> stockByCategory;
    private Map<String, Long> stockByVendor;
}
