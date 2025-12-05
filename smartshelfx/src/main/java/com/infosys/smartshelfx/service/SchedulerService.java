package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.infosys.smartshelfx.dtos.ForecastRequest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Scheduler Service for automated tasks
 * - Low stock monitoring
 * - Expiry alerts
 * - AI demand forecasting triggers
 * - Auto-restock suggestions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SchedulerService {

    private final ProductRepository productRepository;
    private final ProductExpiryRepository productExpiryRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final EmailNotificationService emailNotificationService;
    private final ForecastingService forecastingService;

    @Value("${inventory.low.stock.threshold:10}")
    private int lowStockThreshold;

    @Value("${inventory.critical.stock.threshold:5}")
    private int criticalStockThreshold;

    /**
     * Check for low stock products every hour
     */
    @Scheduled(fixedRate = 3600000) // Every hour
    @Transactional
    public void checkLowStockProducts() {
        log.info("Running scheduled low stock check...");

        List<Product> lowStockProducts = productRepository.findByCurrentStockLessThanEqual(lowStockThreshold);

        for (Product product : lowStockProducts) {
            if (product.getCurrentStock() <= criticalStockThreshold) {
                // Critical stock - notify all admins and warehouse managers
                notifyAboutCriticalStock(product);
            } else if (product.getCurrentStock() <= product.getReorderLevel()) {
                // Low stock - create notification
                notifyAboutLowStock(product);
            }
        }

        log.info("Low stock check completed. Found {} products with low stock", lowStockProducts.size());
    }

    /**
     * Check for expiring products daily at 8 AM
     */
    @Scheduled(cron = "0 0 8 * * ?")
    @Transactional
    public void checkExpiringProducts() {
        log.info("Running scheduled expiry check...");

        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        LocalDate sevenDaysFromNow = LocalDate.now().plusDays(7);

        // Products expiring within 30 days
        List<ProductExpiry> expiringIn30Days = productExpiryRepository
                .findByExpiryDateBetweenAndNotifiedFalse(LocalDate.now(), thirtyDaysFromNow);

        for (ProductExpiry expiry : expiringIn30Days) {
            NotificationPriority priority = expiry.getExpiryDate().isBefore(sevenDaysFromNow)
                    ? NotificationPriority.HIGH
                    : NotificationPriority.MEDIUM;

            // Create notification for warehouse managers
            List<User> warehouseManagers = userRepository.findByRole(Role.WAREHOUSEMANAGER);
            for (User manager : warehouseManagers) {
                notificationService.createExpiryAlert(expiry,
                        (int) java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), expiry.getExpiryDate()));
            }

            expiry.setAlertSent(true);
            productExpiryRepository.save(expiry);
        }

        log.info("Expiry check completed. Found {} products expiring within 30 days", expiringIn30Days.size());
    }

    /**
     * Generate demand forecasts daily at 6 AM
     */
    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void generateDailyForecasts() {
        log.info("Running scheduled demand forecast generation...");

        List<Product> activeProducts = productRepository.findByIsActiveTrue();
        int forecastCount = 0;

        for (Product product : activeProducts) {
            try {
                ForecastRequest request = ForecastRequest.builder()
                        .productId(product.getId())
                        .period("DAILY")
                        .horizon(30)
                        .build();
                forecastingService.generateForecast(request); // 30-day forecast
                forecastCount++;
            } catch (Exception e) {
                log.error("Failed to generate forecast for product {}: {}", product.getId(), e.getMessage());
            }
        }

        log.info("Daily forecast generation completed. Generated {} forecasts", forecastCount);
    }

    /**
     * Generate auto-restock suggestions weekly on Monday at 7 AM
     */
    @Scheduled(cron = "0 0 7 ? * MON")
    @Transactional
    public void generateWeeklyRestockSuggestions() {
        log.info("Running scheduled weekly restock suggestions...");

        List<Product> productsNeedingRestock = productRepository.findProductsNeedingRestock();

        if (!productsNeedingRestock.isEmpty()) {
            // Notify admins about products needing restock
            List<User> admins = userRepository.findByRole(Role.ADMIN);

            for (User admin : admins) {
                notificationService.createNotification(
                        admin,
                        NotificationType.RESTOCK_SUGGESTION,
                        "Weekly Restock Suggestions Available",
                        String.format(
                                "%d products have been identified for restocking based on AI predictions and current stock levels.",
                                productsNeedingRestock.size()),
                        NotificationPriority.MEDIUM,
                        "Product",
                        null,
                        "/inventory/restock-suggestions");
            }
        }

        log.info("Weekly restock suggestions completed. {} products identified", productsNeedingRestock.size());
    }

    /**
     * Clean up old notifications (older than 90 days) weekly
     */
    @Scheduled(cron = "0 0 2 ? * SUN") // Sunday at 2 AM
    @Transactional
    public void cleanupOldNotifications() {
        log.info("Running scheduled notification cleanup...");

        LocalDateTime ninetyDaysAgo = LocalDateTime.now().minusDays(90);
        notificationService.deleteOldNotifications(ninetyDaysAgo);

        log.info("Notification cleanup completed");
    }

    private void notifyAboutLowStock(Product product) {
        notificationService.createLowStockAlert(product);
    }

    private void notifyAboutCriticalStock(Product product) {
        // Notify admins and warehouse managers
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        List<User> warehouseManagers = userRepository.findByRole(Role.WAREHOUSEMANAGER);

        // Use existing notification service method
        notificationService.createLowStockAlert(product);

        // Send email alerts
        for (User admin : admins) {
            emailNotificationService.sendCriticalStockAlert(admin, product);
        }

        for (User manager : warehouseManagers) {
            emailNotificationService.sendCriticalStockAlert(manager, product);
        }
    }
}
