package com.smartshelfx.controller;

import com.smartshelfx.dto.ForecastResponse;
import com.smartshelfx.service.ForecastService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forecast")
@CrossOrigin(origins = "*")
public class ForecastController {
    
    @Autowired
    private ForecastService forecastService;
    
    @GetMapping("/{sku}")
    public ResponseEntity<ForecastResponse> getForecast(@PathVariable String sku) {
        return ResponseEntity.ok(forecastService.getForecastBySku(sku));
    }
}
