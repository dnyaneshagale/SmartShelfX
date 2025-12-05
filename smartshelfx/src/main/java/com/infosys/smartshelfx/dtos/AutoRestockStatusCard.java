package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AutoRestockStatusCard {
    private String title;
    private boolean autoRestockEnabled;
    private int pendingOrders;
    private int completedToday;
    private int scheduledOrders;
    private List<RestockOrder> recentOrders;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RestockOrder {
        private String orderId;
        private String productName;
        private int quantity;
        private String status; // PENDING, APPROVED, ORDERED, DELIVERED
        private String vendorName;
        private String estimatedDelivery;
    }
}
