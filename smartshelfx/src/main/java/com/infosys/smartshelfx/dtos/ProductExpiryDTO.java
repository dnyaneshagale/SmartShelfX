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
public class ProductExpiryDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String batchNumber;
    private Integer quantity;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private Integer daysUntilExpiry;
    private Boolean alertSent;
    private Boolean isExpired;
    private String expiryStatus; // EXPIRED, CRITICAL, WARNING, OK
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
