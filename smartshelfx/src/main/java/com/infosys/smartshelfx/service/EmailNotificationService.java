package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.entity.Notification;
import com.infosys.smartshelfx.entity.Product;
import com.infosys.smartshelfx.entity.PurchaseOrder;
import com.infosys.smartshelfx.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.List;

/**
 * Email Notification Service
 * - Sends email alerts for low stock, expiry, and purchase orders
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${notification.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${notification.email.from:noreply@smartshelfx.com}")
    private String fromEmail;

    @Value("${frontend.url:http://localhost:4200}")
    private String frontendUrl;

    /**
     * Send simple text email
     */
    @Async
    public void sendSimpleEmail(String to, String subject, String body) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would send to: {} - Subject: {}", to, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send HTML email
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        if (!emailEnabled) {
            log.info("Email notifications disabled. Would send HTML email to: {} - Subject: {}", to, subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("HTML email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send HTML email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Send low stock alert email
     */
    @Async
    public void sendLowStockAlert(User user, Product product) {
        String subject = "🚨 Low Stock Alert: " + product.getName();
        String htmlContent = buildLowStockEmailTemplate(product);
        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    /**
     * Send critical stock alert email
     */
    @Async
    public void sendCriticalStockAlert(User user, Product product) {
        String subject = "🔴 CRITICAL: Stock Level Alert - " + product.getName();
        String htmlContent = buildCriticalStockEmailTemplate(product);
        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    /**
     * Send purchase order notification to vendor
     */
    @Async
    public void sendPurchaseOrderNotification(User vendor, PurchaseOrder purchaseOrder) {
        String subject = "📦 New Purchase Order #" + purchaseOrder.getId();
        String htmlContent = buildPurchaseOrderEmailTemplate(purchaseOrder);
        sendHtmlEmail(vendor.getEmail(), subject, htmlContent);
    }

    /**
     * Send purchase order status update
     */
    @Async
    public void sendPurchaseOrderStatusUpdate(User user, PurchaseOrder purchaseOrder) {
        String subject = "📋 Purchase Order #" + purchaseOrder.getId() + " - Status: " + purchaseOrder.getStatus();
        String htmlContent = buildPurchaseOrderStatusEmailTemplate(purchaseOrder);
        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    /**
     * Send expiry alert email
     */
    @Async
    public void sendExpiryAlert(User user, List<Product> expiringProducts) {
        String subject = "⚠️ Product Expiry Alert - " + expiringProducts.size() + " items expiring soon";
        String htmlContent = buildExpiryAlertEmailTemplate(expiringProducts);
        sendHtmlEmail(user.getEmail(), subject, htmlContent);
    }

    private String buildLowStockEmailTemplate(Product product) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .product-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
                        .btn { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Low Stock Alert</h1>
                        </div>
                        <div class="content">
                            <p>The following product has reached low stock levels and requires attention:</p>
                            <div class="product-info">
                                <h3>%s</h3>
                                <p><strong>SKU:</strong> %s</p>
                                <p><strong>Current Stock:</strong> %d units</p>
                                <p><strong>Reorder Level:</strong> %d units</p>
                                <p><strong>Category:</strong> %s</p>
                            </div>
                            <p>Please review and consider placing a reorder.</p>
                            <a href="%s/inventory" class="btn">View Inventory</a>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from SmartShelfX Inventory Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        product.getName(),
                        product.getSku(),
                        product.getCurrentStock(),
                        product.getReorderLevel(),
                        product.getCategory() != null ? product.getCategory().getName() : "N/A",
                        frontendUrl);
    }

    private String buildCriticalStockEmailTemplate(Product product) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .product-info { background-color: white; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f44336; }
                        .btn { display: inline-block; background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>🔴 CRITICAL STOCK ALERT</h1>
                        </div>
                        <div class="content">
                            <p><strong>URGENT:</strong> The following product has reached critical stock levels and requires immediate action:</p>
                            <div class="product-info">
                                <h3>%s</h3>
                                <p><strong>SKU:</strong> %s</p>
                                <p><strong>Current Stock:</strong> <span style="color: red; font-weight: bold;">%d units</span></p>
                                <p><strong>Reorder Level:</strong> %d units</p>
                            </div>
                            <p>Immediate restocking is recommended to avoid stockouts.</p>
                            <a href="%s/inventory" class="btn">Take Action Now</a>
                        </div>
                        <div class="footer">
                            <p>This is an automated CRITICAL alert from SmartShelfX Inventory Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        product.getName(),
                        product.getSku(),
                        product.getCurrentStock(),
                        product.getReorderLevel(),
                        frontendUrl);
    }

    private String buildPurchaseOrderEmailTemplate(PurchaseOrder purchaseOrder) {
        StringBuilder itemsList = new StringBuilder();
        purchaseOrder.getItems().forEach(item -> {
            itemsList.append("<tr>")
                    .append("<td>").append(item.getProduct().getName()).append("</td>")
                    .append("<td>").append(item.getQuantity()).append("</td>")
                    .append("<td>$").append(item.getUnitPrice()).append("</td>")
                    .append("<td>$").append(item.getLineTotal()).append("</td>")
                    .append("</tr>");
        });

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        table { width: 100%%; border-collapse: collapse; margin: 15px 0; }
                        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                        th { background-color: #2196F3; color: white; }
                        .total { font-size: 18px; font-weight: bold; margin-top: 15px; }
                        .btn { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📦 New Purchase Order</h1>
                            <p>Order #%d</p>
                        </div>
                        <div class="content">
                            <p>A new purchase order has been created for your review:</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    %s
                                </tbody>
                            </table>
                            <p class="total">Total Amount: $%s</p>
                            <p><strong>Expected Delivery:</strong> %s</p>
                            <a href="%s/purchase-orders" class="btn">View Order Details</a>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from SmartShelfX Inventory Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        purchaseOrder.getId(),
                        itemsList.toString(),
                        purchaseOrder.getTotalAmount(),
                        purchaseOrder.getExpectedDeliveryDate() != null
                                ? purchaseOrder.getExpectedDeliveryDate().toString()
                                : "TBD",
                        frontendUrl);
    }

    private String buildPurchaseOrderStatusEmailTemplate(PurchaseOrder purchaseOrder) {
        String statusColor = switch (purchaseOrder.getStatus()) {
            case APPROVED -> "#4CAF50";
            case REJECTED -> "#f44336";
            case SENT, ACKNOWLEDGED -> "#2196F3";
            case RECEIVED, CLOSED -> "#4CAF50";
            case CANCELLED -> "#9e9e9e";
            default -> "#ff9800";
        };

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: %s; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        .status-badge { display: inline-block; padding: 5px 15px; background-color: %s; color: white; border-radius: 20px; font-weight: bold; }
                        .btn { display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📋 Purchase Order Update</h1>
                            <p>Order #%d</p>
                        </div>
                        <div class="content">
                            <p>Your purchase order status has been updated:</p>
                            <p>Status: <span class="status-badge">%s</span></p>
                            <p><strong>Total Amount:</strong> $%s</p>
                            <a href="%s/purchase-orders/%d" class="btn">View Order Details</a>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from SmartShelfX Inventory Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        statusColor,
                        statusColor,
                        purchaseOrder.getId(),
                        purchaseOrder.getStatus(),
                        purchaseOrder.getTotalAmount(),
                        frontendUrl,
                        purchaseOrder.getId());
    }

    private String buildExpiryAlertEmailTemplate(List<Product> expiringProducts) {
        StringBuilder productsList = new StringBuilder();
        expiringProducts.forEach(product -> {
            productsList.append("<tr>")
                    .append("<td>").append(product.getName()).append("</td>")
                    .append("<td>").append(product.getSku()).append("</td>")
                    .append("<td>").append(product.getCurrentStock()).append("</td>")
                    .append("</tr>");
        });

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #ff9800; color: white; padding: 20px; text-align: center; }
                        .content { padding: 20px; background-color: #f9f9f9; }
                        table { width: 100%%; border-collapse: collapse; margin: 15px 0; }
                        th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
                        th { background-color: #ff9800; color: white; }
                        .btn { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>⚠️ Product Expiry Alert</h1>
                        </div>
                        <div class="content">
                            <p>The following products are expiring soon and require attention:</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Quantity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    %s
                                </tbody>
                            </table>
                            <p>Please review and take necessary action.</p>
                            <a href="%s/inventory/expiring" class="btn">View Expiring Products</a>
                        </div>
                        <div class="footer">
                            <p>This is an automated message from SmartShelfX Inventory Management System.</p>
                        </div>
                    </div>
                </body>
                </html>
                """
                .formatted(
                        productsList.toString(),
                        frontendUrl);
    }
}
