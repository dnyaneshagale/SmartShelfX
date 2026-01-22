package com.smartshelfx.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "forecasts")
public class Forecast {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @Column(nullable = false, length = 50)
    private String sku;
    
    @Column(name = "predicted_quantity", nullable = false)
    private Integer predictedQuantity;
    
    @Column(name = "forecast_date", nullable = false)
    private LocalDate forecastDate;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // Constructors
    public Forecast() {}
    
    public Forecast(Product product, String sku, Integer predictedQuantity, LocalDate forecastDate) {
        this.product = product;
        this.sku = sku;
        this.predictedQuantity = predictedQuantity;
        this.forecastDate = forecastDate;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Product getProduct() {
        return product;
    }
    
    public void setProduct(Product product) {
        this.product = product;
    }
    
    public String getSku() {
        return sku;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public Integer getPredictedQuantity() {
        return predictedQuantity;
    }
    
    public void setPredictedQuantity(Integer predictedQuantity) {
        this.predictedQuantity = predictedQuantity;
    }
    
    public LocalDate getForecastDate() {
        return forecastDate;
    }
    
    public void setForecastDate(LocalDate forecastDate) {
        this.forecastDate = forecastDate;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
