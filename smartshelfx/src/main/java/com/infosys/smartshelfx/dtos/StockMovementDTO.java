package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private MovementType movementType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private String referenceNumber;
    private Long performedById;
    private String performedByName;
    private LocalDateTime createdAt;
}
