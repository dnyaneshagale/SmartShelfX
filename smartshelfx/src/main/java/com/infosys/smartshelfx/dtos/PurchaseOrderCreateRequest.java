package com.infosys.smartshelfx.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderCreateRequest {
    @NotNull(message = "Vendor ID is required")
    private Long vendorId;

    @NotEmpty(message = "At least one item is required")
    private List<PurchaseOrderItemRequest> items;

    private String notes;
    private String shippingAddress;
    private LocalDateTime expectedDeliveryDate;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseOrderItemRequest {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        private BigDecimal unitPrice;
        private String notes;
    }
}
