package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorStatsDTO {
    private Long vendorId;
    private String vendorName;
    private Long totalProducts;
    private Long inStockCount;
    private Long lowStockCount;
    private Long outOfStockCount;
    private BigDecimal totalInventoryValue;
    private Integer pendingReorders;
    private Integer fulfilledOrdersThisMonth;
    private List<ProductDTO> lowStockProducts;
    private List<ReorderRequestDTO> pendingReorderRequests;
}
