package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.StockStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilterRequest {
    private Long categoryId;
    private Long vendorId;
    private StockStatus stockStatus;
    private String searchTerm;
    private Boolean isActive;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "name";
    private String sortDirection = "ASC";
}
