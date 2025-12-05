package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String sku;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long vendorId;
    private String vendorName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private StockStatus stockStatus;
    private String imageUrl;
    private String unit;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
