package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Notification Service for alerts and notifications
 * - Low stock alerts
 * - Expiry alerts
 * - Vendor response tracking
 * - System notifications
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    /**
     * Create a low stock alert notification
     */
    @Transactional
    public void createLowStockAlert(Product product) {
        NotificationType type = product.getStockStatus() == StockStatus.OUT_OF_STOCK
                ? NotificationType.OUT_OF_STOCK_ALERT
                : NotificationType.LOW_STOCK_ALERT;

        NotificationPriority priority = product.getStockStatus() == StockStatus.OUT_OF_STOCK
                ? NotificationPriority.CRITICAL
                : NotificationPriority.HIGH;

        String title = product.getStockStatus() == StockStatus.OUT_OF_STOCK ? "Out of Stock Alert" : "Low Stock Alert";

        String message = String.format(
                "Product %s (%s) is %s. Current stock: %d, Reorder level: %d",
                product.getName(),
                product.getSku(),
                product.getStockStatus() == StockStatus.OUT_OF_STOCK ? "out of stock" : "running low",
                product.getCurrentStock(),
                product.getReorderLevel());

        // Don't duplicate recent notifications
        List<Notification> recentAlerts = notificationRepository.findRecentByTypeAndEntity(
                type, product.getId(), LocalDateTime.now().minusHours(24));

        if (!recentAlerts.isEmpty()) {
            log.debug("Skipping duplicate low stock alert for product: {}", product.getSku());
            return;
        }

        // Notify all admins and warehouse managers
        List<User> recipients = userRepository.findByRoleIn(
                List.of(Role.ADMIN, Role.WAREHOUSEMANAGER));

        for (User recipient : recipients) {
            createNotification(
                    recipient,
                    type,
                    title,
                    message,
                    priority,
                    "Product",
                    product.getId(),
                    "/inventory/products/" + product.getId());
        }

        log.info("Low stock alert created for product: {}", product.getSku());
    }

    /**
     * Notify vendor about low stock of their product
     */
    @Transactional
    public void notifyVendorLowStock(Product product) {
        User vendor = product.getVendor();
        if (vendor == null)
            return;

        NotificationType type = NotificationType.LOW_STOCK_ALERT;
        NotificationPriority priority = NotificationPriority.HIGH;

        String message = String.format(
                "Your product %s (%s) is running low on stock. Current stock: %d",
                product.getName(),
                product.getSku(),
                product.getCurrentStock());

        // Don't duplicate recent notifications
        List<Notification> recentAlerts = notificationRepository.findRecentByTypeAndEntity(
                type, product.getId(), LocalDateTime.now().minusHours(24));

        boolean vendorAlreadyNotified = recentAlerts.stream()
                .anyMatch(n -> n.getUser().getId().equals(vendor.getId()));

        if (vendorAlreadyNotified) {
            return;
        }

        createNotification(
                vendor,
                type,
                "Low Stock Alert - Your Product",
                message,
                priority,
                "Product",
                product.getId(),
                "/vendor/products/" + product.getId());

        log.info("Vendor {} notified about low stock for product: {}", vendor.getUsername(), product.getSku());
    }

    /**
     * Create expiry alert notification
     */
    @Transactional
    public void createExpiryAlert(ProductExpiry expiry, int daysUntilExpiry) {
        Product product = expiry.getProduct();

        NotificationPriority priority;
        String title;
        if (daysUntilExpiry <= 0) {
            priority = NotificationPriority.CRITICAL;
            title = "Product Expired";
        } else if (daysUntilExpiry <= 7) {
            priority = NotificationPriority.HIGH;
            title = "Product Expiring Soon";
        } else {
            priority = NotificationPriority.MEDIUM;
            title = "Product Expiry Warning";
        }

        String message = String.format(
                "Product %s (%s) - Batch %s: %s. Quantity: %d units",
                product.getName(),
                product.getSku(),
                expiry.getBatchNumber(),
                daysUntilExpiry <= 0 ? "has expired" : "expires in " + daysUntilExpiry + " days",
                expiry.getQuantity());

        // Notify admins and warehouse managers
        List<User> recipients = userRepository.findByRoleIn(
                List.of(Role.ADMIN, Role.WAREHOUSEMANAGER));

        for (User recipient : recipients) {
            createNotification(
                    recipient,
                    NotificationType.EXPIRY_ALERT,
                    title,
                    message,
                    priority,
                    "ProductExpiry",
                    expiry.getId(),
                    "/inventory/expiry/" + expiry.getId());
        }

        // Mark alert as sent
        expiry.setAlertSent(true);

        log.info("Expiry alert created for product: {} batch: {}", product.getSku(), expiry.getBatchNumber());
    }

    /**
     * Create purchase order notification
     */
    @Transactional
    public void createPurchaseOrderNotification(PurchaseOrder po, NotificationType type) {
        String title;
        String message;
        NotificationPriority priority = NotificationPriority.MEDIUM;

        switch (type) {
            case PURCHASE_ORDER_CREATED:
                title = "New Purchase Order";
                message = String.format("Purchase Order %s has been created for vendor %s",
                        po.getPoNumber(), po.getVendor().getUsername());
                break;
            case PURCHASE_ORDER_APPROVED:
                title = "Purchase Order Approved";
                message = String.format("Purchase Order %s has been approved", po.getPoNumber());
                priority = NotificationPriority.HIGH;
                break;
            case PURCHASE_ORDER_REJECTED:
                title = "Purchase Order Rejected";
                message = String.format("Purchase Order %s has been rejected", po.getPoNumber());
                break;
            default:
                title = "Purchase Order Update";
                message = String.format("Purchase Order %s status: %s", po.getPoNumber(), po.getStatus());
        }

        // Notify vendor
        createNotification(
                po.getVendor(),
                type,
                title,
                message,
                priority,
                "PurchaseOrder",
                po.getId(),
                "/vendor/purchase-orders/" + po.getId());

        // Notify admins
        List<User> admins = userRepository.findByRoleIn(List.of(Role.ADMIN));
        for (User admin : admins) {
            createNotification(
                    admin,
                    type,
                    title,
                    message,
                    priority,
                    "PurchaseOrder",
                    po.getId(),
                    "/admin/purchase-orders/" + po.getId());
        }
    }

    /**
     * Create restock suggestion notification
     */
    @Transactional
    public void createRestockSuggestionNotification(Product product, int suggestedQuantity, String reason) {
        String message = String.format(
                "AI suggests restocking %s (%s). Suggested quantity: %d units. Reason: %s",
                product.getName(),
                product.getSku(),
                suggestedQuantity,
                reason);

        // Notify admins and warehouse managers
        List<User> recipients = userRepository.findByRoleIn(
                List.of(Role.ADMIN, Role.WAREHOUSEMANAGER));

        for (User recipient : recipients) {
            createNotification(
                    recipient,
                    NotificationType.REORDER_SUGGESTION,
                    "Restock Suggestion",
                    message,
                    NotificationPriority.MEDIUM,
                    "Product",
                    product.getId(),
                    "/inventory/restock/suggestions");
        }
    }

    /**
     * Create forecast alert notification
     */
    @Transactional
    public void createForecastAlert(Product product, int daysUntilStockout) {
        NotificationPriority priority = daysUntilStockout <= 3 ? NotificationPriority.CRITICAL
                : daysUntilStockout <= 7 ? NotificationPriority.HIGH : NotificationPriority.MEDIUM;

        String message = String.format(
                "AI Forecast Alert: Product %s (%s) is predicted to run out of stock in %d days. " +
                        "Current stock: %d, Reorder level: %d",
                product.getName(),
                product.getSku(),
                daysUntilStockout,
                product.getCurrentStock(),
                product.getReorderLevel());

        // Notify admins and warehouse managers
        List<User> recipients = userRepository.findByRoleIn(
                List.of(Role.ADMIN, Role.WAREHOUSEMANAGER));

        for (User recipient : recipients) {
            createNotification(
                    recipient,
                    NotificationType.FORECAST_ALERT,
                    "Stockout Risk Alert",
                    message,
                    priority,
                    "Product",
                    product.getId(),
                    "/analytics/forecasts/" + product.getId());
        }
    }

    /**
     * Get notifications for current user
     */
    public Page<NotificationDTO> getMyNotifications(int page, int size) {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return Page.empty();
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return notificationRepository.findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(
                currentUser.getId(), pageable).map(this::toDTO);
    }

    /**
     * Get unread notifications for current user
     */
    public List<NotificationDTO> getUnreadNotifications() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return List.of();
        }

        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(currentUser.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /**
     * Get unread notification count for current user
     */
    public Long getUnreadCount() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return 0L;
        }
        return notificationRepository.countUnreadByUserId(currentUser.getId());
    }

    /**
     * Mark notification as read
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.markAsRead(notificationId, LocalDateTime.now());
    }

    /**
     * Mark all notifications as read for current user
     */
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        if (currentUser != null) {
            notificationRepository.markAllAsReadByUserId(currentUser.getId(), LocalDateTime.now());
        }
    }

    /**
     * Dismiss notification
     */
    @Transactional
    public void dismissNotification(Long notificationId) {
        notificationRepository.dismiss(notificationId);
    }

    /**
     * Create a generic notification
     */
    @Transactional
    public Notification createNotification(
            User user,
            NotificationType type,
            String title,
            String message,
            NotificationPriority priority,
            String entityType,
            Long entityId,
            String actionUrl) {

        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .priority(priority)
                .entityType(entityType)
                .entityId(entityId)
                .actionUrl(actionUrl)
                .build();

        return notificationRepository.save(notification);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private NotificationDTO toDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .userId(notification.getUser().getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .priority(notification.getPriority())
                .isRead(notification.getIsRead())
                .isDismissed(notification.getIsDismissed())
                .entityType(notification.getEntityType())
                .entityId(notification.getEntityId())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .readAt(notification.getReadAt())
                .expiresAt(notification.getExpiresAt())
                .build();
    }

    /**
     * Delete old notifications (for cleanup scheduler)
     */
    @Transactional
    public void deleteOldNotifications(LocalDateTime before) {
        notificationRepository.deleteByCreatedAtBefore(before);
        log.info("Deleted notifications created before: {}", before);
    }
}
