package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.ReorderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderRequestDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private String vendorName;
    private Integer currentStock;
    private Integer reorderLevel;
    private Integer requestedQuantity;
    private ReorderStatus status;
    private Long requestedById;
    private String requestedByName;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime requestedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime fulfilledAt;
    private String notes;
}
