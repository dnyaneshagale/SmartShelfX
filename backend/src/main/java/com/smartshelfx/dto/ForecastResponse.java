package com.smartshelfx.dto;

import java.time.LocalDateTime;

public class ForecastResponse {
    private String sku;
    private Integer predictedQuantity;
    private Integer currentStock;
    private Boolean needsReorder;
    private Integer reorderLevel;
    private LocalDateTime forecastDate;
    private String method;
    
    public ForecastResponse() {}
    
    public ForecastResponse(String sku, Integer predictedQuantity, Integer currentStock, Boolean needsReorder) {
        this.sku = sku;
        this.predictedQuantity = predictedQuantity;
        this.currentStock = currentStock;
        this.needsReorder = needsReorder;
    }
    
    public ForecastResponse(String sku, Integer predictedQuantity, Integer currentStock, Boolean needsReorder, Integer reorderLevel, LocalDateTime forecastDate, String method) {
        this.sku = sku;
        this.predictedQuantity = predictedQuantity;
        this.currentStock = currentStock;
        this.needsReorder = needsReorder;
        this.reorderLevel = reorderLevel;
        this.forecastDate = forecastDate;
        this.method = method;
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
    
    public Integer getCurrentStock() {
        return currentStock;
    }
    
    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }
    
    public Boolean getNeedsReorder() {
        return needsReorder;
    }
    
    public void setNeedsReorder(Boolean needsReorder) {
        this.needsReorder = needsReorder;
    }
    
    public Integer getReorderLevel() {
        return reorderLevel;
    }
    
    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
    
    public LocalDateTime getForecastDate() {
        return forecastDate;
    }
    
    public void setForecastDate(LocalDateTime forecastDate) {
        this.forecastDate = forecastDate;
    }
    
    public String getMethod() {
        return method;
    }
    
    public void setMethod(String method) {
        this.method = method;
    }
}
