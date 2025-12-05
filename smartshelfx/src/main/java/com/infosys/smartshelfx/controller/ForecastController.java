package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.service.ForecastingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AI Forecasting Controller
 * - Generate demand forecasts
 * - Get products at risk of stockout
 * - View forecast history
 */
@RestController
@RequestMapping("/api/forecast")
@RequiredArgsConstructor
public class ForecastController {

    private final ForecastingService forecastingService;

    // ==================== FORECAST GENERATION ====================

    /**
     * Generate forecast for a specific product
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<ForecastResponse> generateForecast(@RequestBody ForecastRequest request) {
        return ResponseEntity.ok(forecastingService.generateForecast(request));
    }

    /**
     * Generate forecasts for all products
     */
    @PostMapping("/generate-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ForecastResponse>> generateAllForecasts(
            @RequestParam(defaultValue = "DAILY") String period,
            @RequestParam(defaultValue = "14") int horizon) {
        return ResponseEntity.ok(forecastingService.generateAllForecasts(period, horizon));
    }

    // ==================== AT-RISK PRODUCTS ====================

    /**
     * Get products at risk of stockout (all)
     */
    @GetMapping("/at-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<List<DemandForecastDTO>> getProductsAtRisk() {
        return ResponseEntity.ok(forecastingService.getProductsAtRisk());
    }

    /**
     * Get products at risk for vendor's products
     */
    @GetMapping("/vendor/at-risk")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDOR')")
    public ResponseEntity<List<DemandForecastDTO>> getVendorProductsAtRisk(Authentication authentication) {
        // Get vendor ID from authentication
        Long vendorId = getVendorIdFromAuth(authentication);
        return ResponseEntity.ok(forecastingService.getProductsAtRiskByVendor(vendorId));
    }

    // ==================== FORECAST HISTORY ====================

    /**
     * Get forecast history for a product
     */
    @GetMapping("/history/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER', 'VENDOR')")
    public ResponseEntity<Page<DemandForecastDTO>> getForecastHistory(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(forecastingService.getForecastHistory(productId, page, size));
    }

    /**
     * Get latest forecast for a product
     */
    @GetMapping("/latest/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER', 'VENDOR')")
    public ResponseEntity<DemandForecastDTO> getLatestForecast(@PathVariable Long productId) {
        DemandForecastDTO forecast = forecastingService.getLatestForecast(productId);
        if (forecast == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(forecast);
    }

    private Long getVendorIdFromAuth(Authentication authentication) {
        // Implementation depends on your UserDetails implementation
        // This is a placeholder - adjust based on your UserDetailsImpl
        if (authentication.getPrincipal() instanceof com.infosys.smartshelfx.service.UserDetailsImpl) {
            return ((com.infosys.smartshelfx.service.UserDetailsImpl) authentication.getPrincipal()).getId();
        }
        return null;
    }
}
