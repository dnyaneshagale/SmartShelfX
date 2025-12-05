package com.infosys.smartshelfx.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "demand_forecasts")
public class DemandForecast {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;

    @Column(name = "forecast_period")
    private String forecastPeriod; // "DAILY", "WEEKLY", "MONTHLY"

    @Column(name = "predicted_demand", nullable = false)
    private Integer predictedDemand;

    @Column(name = "confidence_score")
    private Double confidenceScore; // 0.0 to 1.0

    @Column(name = "lower_bound")
    private Integer lowerBound;

    @Column(name = "upper_bound")
    private Integer upperBound;

    @Column(name = "current_stock")
    private Integer currentStock;

    @Column(name = "recommended_restock")
    private Integer recommendedRestock;

    @Column(name = "days_until_stockout")
    private Integer daysUntilStockout;

    @Column(name = "is_at_risk")
    @Builder.Default
    private Boolean isAtRisk = false;

    @Column(name = "model_version")
    private String modelVersion;

    @Column(columnDefinition = "TEXT")
    private String factors; // JSON of factors affecting forecast

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
