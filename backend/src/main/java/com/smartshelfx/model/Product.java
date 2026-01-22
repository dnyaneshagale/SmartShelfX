package com.smartshelfx.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
public class Product {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String sku;
    
    @Column(nullable = false, length = 200)
    private String name;
    
    @Column(length = 100)
    private String category;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "current_stock")
    private Integer currentStock = 0;
    
    @Column(name = "reorder_level")
    private Integer reorderLevel = 10;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id")
    private User vendor;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    // JSON property to expose vendorId without loading the full vendor object
    @JsonProperty("vendorId")
    public Long getVendorId() {
        return vendor != null ? vendor.getId() : null;
    }
    
    @JsonProperty("vendorName")
    public String getVendorName() {
        return vendor != null ? vendor.getFullName() : null;
    }
    
    // Constructors
    public Product() {}
    
    public Product(String sku, String name, String category, BigDecimal price, Integer reorderLevel, User vendor) {
        this.sku = sku;
        this.name = name;
        this.category = category;
        this.price = price;
        this.reorderLevel = reorderLevel;
        this.vendor = vendor;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSku() {
        return sku;
    }
    
    public void setSku(String sku) {
        this.sku = sku;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public Integer getCurrentStock() {
        return currentStock;
    }
    
    public void setCurrentStock(Integer currentStock) {
        this.currentStock = currentStock;
    }
    
    public Integer getReorderLevel() {
        return reorderLevel;
    }
    
    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }
    
    public User getVendor() {
        return vendor;
    }
    
    public void setVendor(User vendor) {
        this.vendor = vendor;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
