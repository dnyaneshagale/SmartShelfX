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
public class DashboardResponse {
    private String username;
    private String role;
    private InventoryLevelCard inventoryLevel;
    private LowStockAlertCard lowStockAlerts;
    private AutoRestockStatusCard autoRestockStatus;
    private List<String> navigationItems;
}
