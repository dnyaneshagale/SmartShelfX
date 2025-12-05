package com.infosys.smartshelfx.dtos;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductUpdateRequest {
    private String name;
    private String description;
    private Long categoryId; // Admin only
    private Long vendorId; // Admin only

    @Min(value = 0, message = "Current stock cannot be negative")
    private Integer currentStock; // Warehouse Manager

    @Min(value = 0, message = "Reorder level cannot be negative")
    private Integer reorderLevel;

    @Min(value = 1, message = "Reorder quantity must be at least 1")
    private Integer reorderQuantity;

    private BigDecimal unitPrice;
    private BigDecimal costPrice;
    private String imageUrl;
    private String unit;
    private Boolean isActive;
}
