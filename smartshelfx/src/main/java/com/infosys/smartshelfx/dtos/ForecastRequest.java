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
public class ForecastRequest {
    private Long productId;
    private List<Long> productIds;
    private Long categoryId;
    private Long vendorId;
    private String period; // DAILY, WEEKLY, MONTHLY
    private Integer horizon; // number of periods to forecast
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean includeSeasonality;
    private Boolean includeTrends;
}
