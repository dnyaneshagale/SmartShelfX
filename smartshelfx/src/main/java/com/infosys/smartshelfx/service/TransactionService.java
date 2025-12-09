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
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Enhanced Transaction Service for Stock-In/Stock-Out operations
 * - Record Incoming Shipments (Stock-In)
 * - Record Outgoing Sales/Dispatches (Stock-Out)
 * - Track Metadata (timestamps, handlers, notes)
 * - Auto-update stock levels
 * - Trigger reorder alerts
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SalesHistoryRepository salesHistoryRepository;
    private final ProductExpiryRepository productExpiryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    /**
     * Record Stock-In (Incoming Shipment)
     * Captures: product, quantity, vendor, handler, timestamp, batch info
     */
    @Transactional
    public StockMovementDTO recordStockIn(StockInRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + request.getProductId()));

        User currentUser = getCurrentUser();
        int previousStock = product.getCurrentStock();
        int newStock = previousStock + request.getQuantity();

        // Update product stock
        product.setCurrentStock(newStock);
        product.updateStockStatus();
        productRepository.save(product);

        // Create stock movement record
        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(MovementType.RECEIVING)
                .quantity(request.getQuantity())
                .previousStock(previousStock)
                .newStock(newStock)
                .reason("Stock received"
                        + (request.getInvoiceReference() != null ? " - Invoice: " + request.getInvoiceReference() : ""))
                .referenceNumber(request.getInvoiceReference())
                .performedBy(currentUser)
                .build();

        movement = stockMovementRepository.save(movement);

        // Handle expiry tracking for perishable goods
        if (request.getExpiryDate() != null) {
            ProductExpiry expiry = ProductExpiry.builder()
                    .product(product)
                    .batchNumber(
                            request.getBatchNumber() != null ? request.getBatchNumber() : generateBatchNumber(product))
                    .quantity(request.getQuantity())
                    .manufacturingDate(request.getManufacturingDate())
                    .expiryDate(request.getExpiryDate())
                    .build();
            productExpiryRepository.save(expiry);
        }

        // Log audit
        auditLogService.logAction(AuditAction.STOCK_UPDATE, "Product", product.getId(),
                "STOCK_IN: " + previousStock + " -> " + newStock + " (+" + request.getQuantity() + ")");

        log.info("Stock-In recorded: Product {} - Qty {} - New Stock {}",
                product.getSku(), request.getQuantity(), newStock);

        return toMovementDTO(movement);
    }

    /**
     * Record Stock-Out (Sales/Dispatch)
     * Captures: product, quantity, customer/order reference, handler, timestamp
     */
    @Transactional
    public StockMovementDTO recordStockOut(StockOutRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + request.getProductId()));

        User currentUser = getCurrentUser();
        int previousStock = product.getCurrentStock();

        // Validate stock availability
        if (previousStock < request.getQuantity()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + previousStock + ", Requested: " + request.getQuantity());
        }

        int newStock = previousStock - request.getQuantity();

        // Update product stock
        product.setCurrentStock(newStock);
        product.updateStockStatus();
        productRepository.save(product);

        // Create stock movement record
        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(MovementType.DISPATCHING)
                .quantity(request.getQuantity())
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(buildStockOutReason(request))
                .referenceNumber(request.getOrderReference())
                .performedBy(currentUser)
                .build();

        movement = stockMovementRepository.save(movement);

        // Record sales history
        BigDecimal unitPrice = request.getUnitPrice() != null ? request.getUnitPrice() : product.getUnitPrice();
        BigDecimal totalAmount = unitPrice != null ? unitPrice.multiply(BigDecimal.valueOf(request.getQuantity()))
                : null;

        SalesHistory sale = SalesHistory.builder()
                .product(product)
                .saleDate(LocalDate.now())
                .quantity(request.getQuantity())
                .unitPrice(unitPrice)
                .totalAmount(totalAmount)
                .orderReference(request.getOrderReference())
                .customerReference(request.getCustomerReference())
                .handledBy(currentUser)
                .notes(request.getNotes())
                .build();

        salesHistoryRepository.save(sale);

        // Log audit
        auditLogService.logAction(AuditAction.STOCK_UPDATE, "Product", product.getId(),
                "STOCK_OUT: " + previousStock + " -> " + newStock + " (-" + request.getQuantity() + ")");

        // Check and trigger low stock alert
        checkAndTriggerLowStockAlert(product);

        log.info("Stock-Out recorded: Product {} - Qty {} - New Stock {}",
                product.getSku(), request.getQuantity(), newStock);

        return toMovementDTO(movement);
    }

    /**
     * Batch Stock-In for multiple products
     */
    @Transactional
    public List<StockMovementDTO> batchStockIn(List<StockInRequest> requests) {
        return requests.stream()
                .map(this::recordStockIn)
                .toList();
    }

    /**
     * Batch Stock-Out for multiple products
     */
    @Transactional
    public List<StockMovementDTO> batchStockOut(List<StockOutRequest> requests) {
        return requests.stream()
                .map(this::recordStockOut)
                .toList();
    }

    /**
     * Get all stock movements with pagination
     */
    public Page<StockMovementDTO> getAllStockMovements(
            MovementType type, Long productId, Long handlerId,
            LocalDateTime startDate, LocalDateTime endDate,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<StockMovement> movements;
        if (productId != null) {
            movements = stockMovementRepository.findByProductId(productId, pageable);
        } else if (handlerId != null) {
            movements = stockMovementRepository.findByPerformedById(handlerId, pageable);
        } else {
            movements = stockMovementRepository.findAll(pageable);
        }

        return movements.map(this::toMovementDTO);
    }

    /**
     * Get stock movements filtered by performedBy user (for Warehouse Managers)
     */
    public Page<StockMovementDTO> getStockMovementsByPerformedBy(
            Long userId, MovementType type, Long productId,
            LocalDateTime startDate, LocalDateTime endDate,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<StockMovement> movements;
        if (productId != null) {
            movements = stockMovementRepository.findByProductIdAndPerformedById(productId, userId, pageable);
        } else {
            movements = stockMovementRepository.findByPerformedById(userId, pageable);
        }

        return movements.map(this::toMovementDTO);
    }

    /**
     * Get stock movements by date range
     */
    public List<StockMovementDTO> getStockMovementsByDateRange(
            LocalDateTime startDate, LocalDateTime endDate) {
        return stockMovementRepository.findByDateRange(startDate, endDate)
                .stream()
                .map(this::toMovementDTO)
                .toList();
    }

    /**
     * Get stock movements by date range and user (for Warehouse Managers)
     */
    public List<StockMovementDTO> getStockMovementsByDateRangeAndUser(
            Long userId, LocalDateTime startDate, LocalDateTime endDate) {
        return stockMovementRepository.findByPerformedByIdAndDateRange(userId, startDate, endDate)
                .stream()
                .map(this::toMovementDTO)
                .toList();
    }

    /**
     * Get sales history with pagination
     */
    public Page<SalesHistoryDTO> getSalesHistory(
            Long productId, LocalDate startDate, LocalDate endDate,
            int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "saleDate"));

        Page<SalesHistory> sales;
        if (productId != null) {
            sales = salesHistoryRepository.findByProductId(productId, pageable);
        } else {
            sales = salesHistoryRepository.findAll(pageable);
        }

        return sales.map(this::toSalesDTO);
    }

    /**
     * Check stock levels and trigger alerts
     */
    private void checkAndTriggerLowStockAlert(Product product) {
        if (product.getStockStatus() == StockStatus.LOW_STOCK ||
                product.getStockStatus() == StockStatus.OUT_OF_STOCK) {

            // Notify admin and warehouse managers
            notificationService.createLowStockAlert(product);

            // Notify vendor
            notificationService.notifyVendorLowStock(product);

            log.warn("Low stock alert triggered for product: {} (Stock: {}, Reorder Level: {})",
                    product.getSku(), product.getCurrentStock(), product.getReorderLevel());
        }
    }

    private String buildStockOutReason(StockOutRequest request) {
        StringBuilder reason = new StringBuilder("Stock dispatched");
        if (request.getOrderReference() != null) {
            reason.append(" - Order: ").append(request.getOrderReference());
        }
        if (request.getCustomerReference() != null) {
            reason.append(" - Customer: ").append(request.getCustomerReference());
        }
        return reason.toString();
    }

    private String generateBatchNumber(Product product) {
        return "BATCH-" + product.getSku() + "-" +
                LocalDate.now().toString().replace("-", "") + "-" +
                System.currentTimeMillis() % 10000;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName();
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    private StockMovementDTO toMovementDTO(StockMovement movement) {
        return StockMovementDTO.builder()
                .id(movement.getId())
                .productId(movement.getProduct().getId())
                .productName(movement.getProduct().getName())
                .productSku(movement.getProduct().getSku())
                .movementType(movement.getMovementType())
                .quantity(movement.getQuantity())
                .previousStock(movement.getPreviousStock())
                .newStock(movement.getNewStock())
                .reason(movement.getReason())
                .referenceNumber(movement.getReferenceNumber())
                .performedById(movement.getPerformedBy() != null ? movement.getPerformedBy().getId() : null)
                .performedByName(movement.getPerformedBy() != null ? movement.getPerformedBy().getUsername() : null)
                .createdAt(movement.getCreatedAt())
                .build();
    }

    private SalesHistoryDTO toSalesDTO(SalesHistory sale) {
        return SalesHistoryDTO.builder()
                .id(sale.getId())
                .productId(sale.getProduct().getId())
                .productName(sale.getProduct().getName())
                .productSku(sale.getProduct().getSku())
                .saleDate(sale.getSaleDate())
                .quantity(sale.getQuantity())
                .unitPrice(sale.getUnitPrice())
                .totalAmount(sale.getTotalAmount())
                .orderReference(sale.getOrderReference())
                .customerReference(sale.getCustomerReference())
                .handledById(sale.getHandledBy() != null ? sale.getHandledBy().getId() : null)
                .handledByName(sale.getHandledBy() != null ? sale.getHandledBy().getUsername() : null)
                .notes(sale.getNotes())
                .createdAt(sale.getCreatedAt())
                .build();
    }
}
