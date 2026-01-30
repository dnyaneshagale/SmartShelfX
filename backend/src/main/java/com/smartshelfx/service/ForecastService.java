package com.smartshelfx.service;

import com.smartshelfx.dto.ForecastResponse;
import com.smartshelfx.model.Forecast;
import com.smartshelfx.model.Product;
import com.smartshelfx.repository.ForecastRepository;
import com.smartshelfx.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Service
public class ForecastService {
    
    @Autowired
    private ForecastRepository forecastRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    public ForecastResponse getForecastBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        
        LocalDateTime forecastDate = LocalDateTime.now();
        String method;
        Integer predictedQuantity;
        
        try {
            // Call AI service
            String url = aiServiceUrl + "/forecast/" + sku;
            Map<String, Object> aiResponse = restTemplate.getForObject(url, Map.class);
            
            predictedQuantity = (Integer) aiResponse.get("predictedQuantity");
            method = "AI-Based Time Series Analysis";
            
            // Save forecast
            Forecast forecast = new Forecast();
            forecast.setProduct(product);
            forecast.setSku(sku);
            forecast.setPredictedQuantity(predictedQuantity);
            forecast.setForecastDate(LocalDate.now());
            forecastRepository.save(forecast);
            
        } catch (Exception e) {
            // Fallback: simple calculation
            predictedQuantity = product.getReorderLevel() + 10;
            method = "Fallback: Reorder Level Based";
        }
        
        // Check if reorder needed
        Boolean needsReorder = predictedQuantity > product.getCurrentStock();
        
        return new ForecastResponse(
            sku, 
            predictedQuantity, 
            product.getCurrentStock(), 
            needsReorder,
            product.getReorderLevel(),
            forecastDate,
            method
        );
    }
    
    public Forecast getLatestForecastBySku(String sku) {
        return forecastRepository.findBySkuOrderByCreatedAtDesc(sku)
                .stream()
                .findFirst()
                .orElse(null);
    }
}
