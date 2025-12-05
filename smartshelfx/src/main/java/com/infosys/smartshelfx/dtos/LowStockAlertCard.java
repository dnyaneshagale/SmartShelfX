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
public class LowStockAlertCard {
    private String title;
    private int totalAlerts;
    private int criticalAlerts;
    private int warningAlerts;
    private List<AlertItem> recentAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlertItem {
        private String productName;
        private String productCode;
        private int currentStock;
        private int minimumStock;
        private String severity; // CRITICAL, WARNING
        private String timestamp;
    }
}
