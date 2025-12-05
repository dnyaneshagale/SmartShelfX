package com.infosys.smartshelfx.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLevelCard {
    private String title;
    private int totalItems;
    private int inStock;
    private int lowStock;
    private int outOfStock;
    private double stockHealthPercentage;
}
