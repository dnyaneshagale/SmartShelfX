package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.ProductExpiryDTO;
import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Expiry Alert Service
 * - Track product expiry dates
 * - Send alerts for products nearing expiry
 * - Mark expired products
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ExpiryAlertService {

    private final ProductExpiryRepository productExpiryRepository;
    private final NotificationService notificationService;

    private static final int DEFAULT_ALERT_DAYS = 30; // Alert 30 days before expiry

    /**
     * Check for expiring products and send alerts
     * Runs daily at 6 AM
     */
    @Scheduled(cron = "0 0 6 * * ?")
    @Transactional
    public void checkExpiryAlerts() {
        log.info("Running expiry alert check...");

        LocalDate today = LocalDate.now();
        LocalDate alertDate = today.plusDays(DEFAULT_ALERT_DAYS);

        // Find items nearing expiry that haven't been alerted
        List<ProductExpiry> nearingExpiry = productExpiryRepository
                .findItemsNearingExpiry(today, alertDate);

        for (ProductExpiry expiry : nearingExpiry) {
            int daysUntilExpiry = (int) ChronoUnit.DAYS.between(today, expiry.getExpiryDate());
            notificationService.createExpiryAlert(expiry, daysUntilExpiry);
            expiry.setAlertSent(true);
            productExpiryRepository.save(expiry);
        }

        // Mark expired items
        List<ProductExpiry> expiredItems = productExpiryRepository.findExpiredItems(today);
        for (ProductExpiry expiry : expiredItems) {
            if (!expiry.getIsExpired()) {
                expiry.setIsExpired(true);
                productExpiryRepository.save(expiry);
                notificationService.createExpiryAlert(expiry, 0);
            }
        }

        log.info("Expiry check complete. {} items nearing expiry, {} items expired",
                nearingExpiry.size(), expiredItems.size());
    }

    /**
     * Get all expiry records with pagination
     */
    public Page<ProductExpiryDTO> getAllExpiryRecords(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "expiryDate"));
        return productExpiryRepository.findAllValidOrderByExpiryDate(pageable)
                .map(this::toDTO);
    }

    /**
     * Get expiry records for a product
     */
    public Page<ProductExpiryDTO> getExpiryRecordsByProduct(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "expiryDate"));
        return productExpiryRepository.findByProductId(productId, pageable)
                .map(this::toDTO);
    }

    /**
     * Get items nearing expiry
     */
    public List<ProductExpiryDTO> getItemsNearingExpiry(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate alertDate = today.plusDays(daysAhead);

        return productExpiryRepository.findItemsNearingExpiry(today, alertDate)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get expired items
     */
    public List<ProductExpiryDTO> getExpiredItems() {
        return productExpiryRepository.findExpiredItems(LocalDate.now())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get expiry items by vendor
     */
    public List<ProductExpiryDTO> getNearExpiryByVendor(Long vendorId, int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate alertDate = today.plusDays(daysAhead);

        return productExpiryRepository.findNearExpiryByVendor(vendorId, today, alertDate)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private ProductExpiryDTO toDTO(ProductExpiry expiry) {
        LocalDate today = LocalDate.now();
        int daysUntilExpiry = (int) ChronoUnit.DAYS.between(today, expiry.getExpiryDate());

        String expiryStatus;
        if (expiry.getIsExpired() || daysUntilExpiry < 0) {
            expiryStatus = "EXPIRED";
        } else if (daysUntilExpiry <= 7) {
            expiryStatus = "CRITICAL";
        } else if (daysUntilExpiry <= 30) {
            expiryStatus = "WARNING";
        } else {
            expiryStatus = "OK";
        }

        return ProductExpiryDTO.builder()
                .id(expiry.getId())
                .productId(expiry.getProduct().getId())
                .productName(expiry.getProduct().getName())
                .productSku(expiry.getProduct().getSku())
                .batchNumber(expiry.getBatchNumber())
                .quantity(expiry.getQuantity())
                .manufacturingDate(expiry.getManufacturingDate())
                .expiryDate(expiry.getExpiryDate())
                .daysUntilExpiry(daysUntilExpiry)
                .alertSent(expiry.getAlertSent())
                .isExpired(expiry.getIsExpired())
                .expiryStatus(expiryStatus)
                .createdAt(expiry.getCreatedAt())
                .updatedAt(expiry.getUpdatedAt())
                .build();
    }
}
