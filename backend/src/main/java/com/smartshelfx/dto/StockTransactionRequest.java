package com.smartshelfx.dto;

public class StockTransactionRequest {
    private Long productId;
    private String transactionType; // IN or OUT
    private Integer quantity;
    private String remarks;
    private Long requestedById; // ID of the user creating the request
    
    public StockTransactionRequest() {}
    
    public StockTransactionRequest(Long productId, String transactionType, Integer quantity, String remarks, Long requestedById) {
        this.productId = productId;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.remarks = remarks;
        this.requestedById = requestedById;
    }
    
    public Long getProductId() {
        return productId;
    }
    
    public void setProductId(Long productId) {
        this.productId = productId;
    }
    
    public String getTransactionType() {
        return transactionType;
    }
    
    public void setTransactionType(String transactionType) {
        this.transactionType = transactionType;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getRemarks() {
        return remarks;
    }
    
    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
    
    public Long getRequestedById() {
        return requestedById;
    }
    
    public void setRequestedById(Long requestedById) {
        this.requestedById = requestedById;
    }
}
