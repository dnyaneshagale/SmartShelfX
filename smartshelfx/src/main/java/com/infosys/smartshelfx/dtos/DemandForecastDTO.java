package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandForecastDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String vendorName;
    private LocalDate forecastDate;
    private String forecastPeriod;
    private Integer predictedDemand;
    private Double confidenceScore;
    private Integer lowerBound;
    private Integer upperBound;
    private Integer currentStock;
    private Integer recommendedRestock;
    private Integer daysUntilStockout;
    private Boolean isAtRisk;
    private String riskLevel; // LOW, MEDIUM, HIGH, CRITICAL
    private String modelVersion;
    private String factors;
    private LocalDateTime createdAt;
    private String suggestedAction;
}
