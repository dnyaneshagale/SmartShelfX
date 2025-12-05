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
public class AIForecastRequest {
    private Long productId;
    private String productSku;
    private List<HistoricalDataPoint> historicalData;
    private String period; // DAILY, WEEKLY, MONTHLY
    private Integer horizon; // number of periods to forecast
    private Boolean includeSeasonality;
    private Boolean includeTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HistoricalDataPoint {
        private LocalDate date;
        private Integer quantity;
        private Double price;
    }
}
