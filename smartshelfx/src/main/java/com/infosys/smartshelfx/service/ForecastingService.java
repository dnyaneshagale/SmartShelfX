package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * AI Forecasting Service
 * - Analyze historical stock data
 * - Predict demand for each item (daily/weekly)
 * - Highlight products at risk of stockout
 * - Integrate with Python AI microservice
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ForecastingService {

    private final ProductRepository productRepository;
    private final SalesHistoryRepository salesHistoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final DemandForecastRepository demandForecastRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    @Value("${ai.service.enabled:false}")
    private boolean aiServiceEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generate forecast for a specific product
     */
    @Transactional
    public ForecastResponse generateForecast(ForecastRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + request.getProductId()));

        // Get historical sales data
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(6); // 6 months of historical data

        List<SalesHistory> salesHistory = salesHistoryRepository
                .findByProductIdAndDateRange(product.getId(), startDate, endDate);

        // Generate forecast
        ForecastResponse response;
        if (aiServiceEnabled) {
            response = generateForecastFromAI(product, salesHistory, request);
        } else {
            response = generateForecastLocally(product, salesHistory, request);
        }

        // Save forecast results
        saveForecastResults(product, response, request.getPeriod());

        // Check for stockout risk and create alerts
        if (response.getSummary() != null && response.getSummary().getDaysUntilStockout() != null
                && response.getSummary().getDaysUntilStockout() <= 14) {
            notificationService.createForecastAlert(product, response.getSummary().getDaysUntilStockout());
        }

        return response;
    }

    /**
     * Generate forecasts for all products
     */
    @Transactional
    public List<ForecastResponse> generateAllForecasts(String period, int horizon) {
        List<Product> products = productRepository.findAll();
        List<ForecastResponse> forecasts = new ArrayList<>();

        for (Product product : products) {
            try {
                ForecastRequest request = ForecastRequest.builder()
                        .productId(product.getId())
                        .period(period != null ? period : "DAILY")
                        .horizon(horizon > 0 ? horizon : 14)
                        .build();

                forecasts.add(generateForecast(request));
            } catch (Exception e) {
                log.error("Error generating forecast for product: {}", product.getSku(), e);
            }
        }

        return forecasts;
    }

    /**
     * Get products at risk of stockout
     */
    public List<DemandForecastDTO> getProductsAtRisk() {
        return demandForecastRepository.findProductsAtRisk()
                .stream()
                .map(this::toForecastDTO)
                .toList();
    }

    /**
     * Get products at risk for a specific vendor
     */
    public List<DemandForecastDTO> getProductsAtRiskByVendor(Long vendorId) {
        return demandForecastRepository.findProductsAtRiskByVendor(vendorId)
                .stream()
                .map(this::toForecastDTO)
                .toList();
    }

    /**
     * Get forecast history for a product
     */
    public Page<DemandForecastDTO> getForecastHistory(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return demandForecastRepository.findByProductId(productId, pageable)
                .map(this::toForecastDTO);
    }

    /**
     * Get latest forecast for a product
     */
    public DemandForecastDTO getLatestForecast(Long productId) {
        return demandForecastRepository.findTopByProductIdOrderByCreatedAtDesc(productId)
                .map(this::toForecastDTO)
                .orElse(null);
    }

    /**
     * Call AI microservice for forecast
     */
    private ForecastResponse generateForecastFromAI(
            Product product,
            List<SalesHistory> salesHistory,
            ForecastRequest request) {

        try {
            // Prepare request for AI service
            AIForecastRequest aiRequest = AIForecastRequest.builder()
                    .productId(product.getId())
                    .productSku(product.getSku())
                    .historicalData(salesHistory.stream()
                            .map(sh -> AIForecastRequest.HistoricalDataPoint.builder()
                                    .date(sh.getSaleDate())
                                    .quantity(sh.getQuantity())
                                    .price(sh.getUnitPrice() != null ? sh.getUnitPrice().doubleValue() : null)
                                    .build())
                            .toList())
                    .period(request.getPeriod())
                    .horizon(request.getHorizon() != null ? request.getHorizon() : 14)
                    .includeSeasonality(request.getIncludeSeasonality())
                    .includeTrends(request.getIncludeTrends())
                    .build();

            // Call AI service
            AIForecastResponse aiResponse = restTemplate.postForObject(
                    aiServiceUrl + "/api/forecast",
                    aiRequest,
                    AIForecastResponse.class);

            if (aiResponse == null) {
                log.warn("AI service returned null response, falling back to local forecast");
                return generateForecastLocally(product, salesHistory, request);
            }

            // Convert AI response to ForecastResponse
            return convertAIResponse(product, aiResponse, request);

        } catch (Exception e) {
            log.error("Error calling AI service, falling back to local forecast", e);
            return generateForecastLocally(product, salesHistory, request);
        }
    }

    /**
     * Generate forecast locally using simple moving average
     */
    private ForecastResponse generateForecastLocally(
            Product product,
            List<SalesHistory> salesHistory,
            ForecastRequest request) {

        int horizon = request.getHorizon() != null ? request.getHorizon() : 14;
        String period = request.getPeriod() != null ? request.getPeriod() : "DAILY";

        // Calculate average daily sales
        double avgDailySales = 0;
        if (!salesHistory.isEmpty()) {
            int totalSales = salesHistory.stream().mapToInt(SalesHistory::getQuantity).sum();
            long daysCovered = java.time.temporal.ChronoUnit.DAYS.between(
                    salesHistory.get(0).getSaleDate(),
                    salesHistory.get(salesHistory.size() - 1).getSaleDate()) + 1;
            avgDailySales = daysCovered > 0 ? (double) totalSales / daysCovered : 0;
        }

        // If no sales history, use a baseline estimate
        if (avgDailySales == 0) {
            avgDailySales = product.getReorderQuantity() != null ? (double) product.getReorderQuantity() / 30 : 1;
        }

        // Generate forecast data points
        List<ForecastResponse.ForecastDataPoint> forecasts = new ArrayList<>();
        LocalDate startDate = LocalDate.now().plusDays(1);
        int projectedStock = product.getCurrentStock();

        for (int i = 0; i < horizon; i++) {
            int predictedDemand = (int) Math.ceil(avgDailySales);
            int lowerBound = (int) Math.floor(avgDailySales * 0.7);
            int upperBound = (int) Math.ceil(avgDailySales * 1.3);

            projectedStock -= predictedDemand;

            forecasts.add(ForecastResponse.ForecastDataPoint.builder()
                    .date(startDate.plusDays(i))
                    .predictedDemand(predictedDemand)
                    .lowerBound(lowerBound)
                    .upperBound(upperBound)
                    .confidence(0.75)
                    .projectedStock(Math.max(0, projectedStock))
                    .stockoutRisk(projectedStock <= 0)
                    .build());
        }

        // Calculate days until stockout
        int daysUntilStockout = calculateDaysUntilStockout(product.getCurrentStock(), avgDailySales);

        // Calculate recommended restock
        int recommendedRestock = calculateRecommendedRestock(product, avgDailySales, daysUntilStockout);

        // Build summary
        int totalPredictedDemand = (int) Math.ceil(avgDailySales * horizon);
        ForecastResponse.ForecastSummary summary = ForecastResponse.ForecastSummary.builder()
                .totalPredictedDemand(totalPredictedDemand)
                .averageDailyDemand((int) Math.ceil(avgDailySales))
                .peakDemand((int) Math.ceil(avgDailySales * 1.5))
                .peakDemandDate(startDate.plusDays(horizon / 2))
                .daysUntilStockout(daysUntilStockout)
                .recommendedRestock(recommendedRestock)
                .riskAssessment(assessRisk(daysUntilStockout))
                .recommendations(generateRecommendations(product, daysUntilStockout, recommendedRestock))
                .build();

        return ForecastResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .period(period)
                .forecastStartDate(startDate)
                .forecastEndDate(startDate.plusDays(horizon - 1))
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .forecasts(forecasts)
                .summary(summary)
                .modelVersion("LOCAL_SMA_V1")
                .overallConfidence(0.75)
                .build();
    }

    private ForecastResponse convertAIResponse(
            Product product,
            AIForecastResponse aiResponse,
            ForecastRequest request) {

        List<ForecastResponse.ForecastDataPoint> forecasts = new ArrayList<>();
        int projectedStock = product.getCurrentStock();

        for (AIForecastResponse.PredictionPoint point : aiResponse.getPredictions()) {
            projectedStock -= point.getPredictedQuantity();

            forecasts.add(ForecastResponse.ForecastDataPoint.builder()
                    .date(point.getDate())
                    .predictedDemand(point.getPredictedQuantity())
                    .lowerBound(point.getLowerBound())
                    .upperBound(point.getUpperBound())
                    .confidence(point.getConfidence())
                    .projectedStock(Math.max(0, projectedStock))
                    .stockoutRisk(projectedStock <= 0)
                    .build());
        }

        // Calculate metrics
        int totalPredicted = aiResponse.getPredictions().stream()
                .mapToInt(AIForecastResponse.PredictionPoint::getPredictedQuantity)
                .sum();
        double avgDaily = aiResponse.getPredictions().isEmpty() ? 0
                : (double) totalPredicted / aiResponse.getPredictions().size();
        int daysUntilStockout = calculateDaysUntilStockout(product.getCurrentStock(), avgDaily);
        int recommendedRestock = calculateRecommendedRestock(product, avgDaily, daysUntilStockout);

        ForecastResponse.ForecastSummary summary = ForecastResponse.ForecastSummary.builder()
                .totalPredictedDemand(totalPredicted)
                .averageDailyDemand((int) Math.ceil(avgDaily))
                .peakDemand(aiResponse.getPredictions().stream()
                        .mapToInt(AIForecastResponse.PredictionPoint::getPredictedQuantity)
                        .max().orElse(0))
                .daysUntilStockout(daysUntilStockout)
                .recommendedRestock(recommendedRestock)
                .riskAssessment(assessRisk(daysUntilStockout))
                .recommendations(generateRecommendations(product, daysUntilStockout, recommendedRestock))
                .build();

        return ForecastResponse.builder()
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .period(request.getPeriod())
                .forecastStartDate(aiResponse.getPredictions().isEmpty() ? LocalDate.now()
                        : aiResponse.getPredictions().get(0).getDate())
                .forecastEndDate(aiResponse.getPredictions().isEmpty() ? LocalDate.now()
                        : aiResponse.getPredictions().get(aiResponse.getPredictions().size() - 1).getDate())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .forecasts(forecasts)
                .summary(summary)
                .modelVersion(aiResponse.getModelVersion())
                .overallConfidence(aiResponse.getAccuracy())
                .build();
    }

    private void saveForecastResults(Product product, ForecastResponse response, String period) {
        if (response.getSummary() == null)
            return;

        DemandForecast forecast = DemandForecast.builder()
                .product(product)
                .forecastDate(LocalDate.now())
                .forecastPeriod(period != null ? period : "DAILY")
                .predictedDemand(response.getSummary().getTotalPredictedDemand())
                .confidenceScore(response.getOverallConfidence())
                .lowerBound((int) (response.getSummary().getTotalPredictedDemand() * 0.7))
                .upperBound((int) (response.getSummary().getTotalPredictedDemand() * 1.3))
                .currentStock(product.getCurrentStock())
                .recommendedRestock(response.getSummary().getRecommendedRestock())
                .daysUntilStockout(response.getSummary().getDaysUntilStockout())
                .isAtRisk(response.getSummary().getDaysUntilStockout() != null &&
                        response.getSummary().getDaysUntilStockout() <= 14)
                .modelVersion(response.getModelVersion())
                .build();

        demandForecastRepository.save(forecast);
    }

    private int calculateDaysUntilStockout(int currentStock, double avgDailySales) {
        if (avgDailySales <= 0)
            return Integer.MAX_VALUE;
        return (int) Math.floor(currentStock / avgDailySales);
    }

    private int calculateRecommendedRestock(Product product, double avgDailySales, int daysUntilStockout) {
        // Target: 30 days of stock
        int targetDays = 30;
        int targetStock = (int) Math.ceil(avgDailySales * targetDays);
        int currentStock = product.getCurrentStock();
        int recommendedRestock = Math.max(0, targetStock - currentStock);

        // Ensure at least the reorder quantity
        if (product.getReorderQuantity() != null) {
            recommendedRestock = Math.max(recommendedRestock, product.getReorderQuantity());
        }

        return recommendedRestock;
    }

    private String assessRisk(int daysUntilStockout) {
        if (daysUntilStockout <= 3)
            return "CRITICAL";
        if (daysUntilStockout <= 7)
            return "HIGH";
        if (daysUntilStockout <= 14)
            return "MEDIUM";
        return "LOW";
    }

    private List<String> generateRecommendations(Product product, int daysUntilStockout, int recommendedRestock) {
        List<String> recommendations = new ArrayList<>();

        if (daysUntilStockout <= 3) {
            recommendations.add("URGENT: Place emergency restock order immediately");
            recommendations.add("Consider expedited shipping options");
        } else if (daysUntilStockout <= 7) {
            recommendations.add("Place restock order within the next 1-2 days");
        } else if (daysUntilStockout <= 14) {
            recommendations.add("Schedule restock order for next week");
        }

        if (recommendedRestock > 0) {
            recommendations.add(String.format("Suggested restock quantity: %d units", recommendedRestock));
        }

        if (product.getCurrentStock() <= product.getReorderLevel()) {
            recommendations.add("Stock is below reorder level - immediate action recommended");
        }

        return recommendations;
    }

    private DemandForecastDTO toForecastDTO(DemandForecast forecast) {
        Product product = forecast.getProduct();
        String riskLevel = assessRisk(
                forecast.getDaysUntilStockout() != null ? forecast.getDaysUntilStockout() : Integer.MAX_VALUE);

        String suggestedAction = "";
        if ("CRITICAL".equals(riskLevel)) {
            suggestedAction = "Place emergency order immediately";
        } else if ("HIGH".equals(riskLevel)) {
            suggestedAction = "Order within 1-2 days";
        } else if ("MEDIUM".equals(riskLevel)) {
            suggestedAction = "Schedule order for next week";
        } else {
            suggestedAction = "Monitor stock levels";
        }

        return DemandForecastDTO.builder()
                .id(forecast.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productSku(product.getSku())
                .vendorName(product.getVendor() != null ? product.getVendor().getUsername() : null)
                .forecastDate(forecast.getForecastDate())
                .forecastPeriod(forecast.getForecastPeriod())
                .predictedDemand(forecast.getPredictedDemand())
                .confidenceScore(forecast.getConfidenceScore())
                .lowerBound(forecast.getLowerBound())
                .upperBound(forecast.getUpperBound())
                .currentStock(forecast.getCurrentStock())
                .recommendedRestock(forecast.getRecommendedRestock())
                .daysUntilStockout(forecast.getDaysUntilStockout())
                .isAtRisk(forecast.getIsAtRisk())
                .riskLevel(riskLevel)
                .modelVersion(forecast.getModelVersion())
                .factors(forecast.getFactors())
                .createdAt(forecast.getCreatedAt())
                .suggestedAction(suggestedAction)
                .build();
    }
}
