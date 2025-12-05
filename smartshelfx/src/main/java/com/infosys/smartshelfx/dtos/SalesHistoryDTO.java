package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesHistoryDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private LocalDate saleDate;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String orderReference;
    private String customerReference;
    private Long handledById;
    private String handledByName;
    private String notes;
    private LocalDateTime createdAt;
}
