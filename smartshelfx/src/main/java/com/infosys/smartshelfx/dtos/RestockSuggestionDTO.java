package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestockSuggestionDTO {
    private Long productId;
    private String productName;
    private String productSku;
    private Long vendorId;
    private String vendorName;
    private Long categoryId;
    private String categoryName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer reorderQuantity;
    private Integer suggestedQuantity;
    private Integer predictedDemand;
    private Integer daysUntilStockout;
    private String urgency; // CRITICAL, HIGH, MEDIUM, LOW
    private Double confidenceScore;
    private String reason;
    private Boolean autoApproved;
}
