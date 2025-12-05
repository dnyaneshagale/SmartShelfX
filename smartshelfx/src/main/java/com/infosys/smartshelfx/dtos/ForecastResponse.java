package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForecastResponse {
    private Long productId;
    private String productName;
    private String productSku;
    private String period;
    private LocalDate forecastStartDate;
    private LocalDate forecastEndDate;
    private Integer currentStock;
    private Integer reorderLevel;
    private List<ForecastDataPoint> forecasts;
    private ForecastSummary summary;
    private String modelVersion;
    private Double overallConfidence;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastDataPoint {
        private LocalDate date;
        private Integer predictedDemand;
        private Integer lowerBound;
        private Integer upperBound;
        private Double confidence;
        private Integer projectedStock;
        private Boolean stockoutRisk;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ForecastSummary {
        private Integer totalPredictedDemand;
        private Integer averageDailyDemand;
        private Integer peakDemand;
        private LocalDate peakDemandDate;
        private Integer daysUntilStockout;
        private Integer recommendedRestock;
        private String riskAssessment;
        private List<String> recommendations;
    }
}
