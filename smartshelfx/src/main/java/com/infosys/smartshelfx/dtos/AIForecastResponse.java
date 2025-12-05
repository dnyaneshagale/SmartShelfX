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
public class AIForecastResponse {
    private Long productId;
    private String productSku;
    private String modelUsed;
    private String modelVersion;
    private Double accuracy;
    private List<PredictionPoint> predictions;
    private AnalysisMetrics metrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PredictionPoint {
        private LocalDate date;
        private Integer predictedQuantity;
        private Integer lowerBound;
        private Integer upperBound;
        private Double confidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnalysisMetrics {
        private Double meanAbsoluteError;
        private Double rootMeanSquareError;
        private Double meanAbsolutePercentageError;
        private String trendDirection; // INCREASING, DECREASING, STABLE
        private Double seasonalityStrength;
        private List<String> significantFactors;
    }
}
