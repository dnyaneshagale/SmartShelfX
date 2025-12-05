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
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final ReorderRequestRepository reorderRequestRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public StockMovementDTO updateStock(StockUpdateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + request.getProductId()));

        User currentUser = getCurrentUser();
        int previousStock = product.getCurrentStock();
        int newStock;

        // Calculate new stock based on movement type
        switch (request.getMovementType()) {
            case RECEIVING:
            case RETURN:
            case TRANSFER_IN:
            case RESTOCK:
                newStock = previousStock + request.getQuantity();
                break;
            case DISPATCHING:
            case DAMAGE:
            case TRANSFER_OUT:
                if (previousStock < request.getQuantity()) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Insufficient stock. Available: " + previousStock + ", Requested: "
                                    + request.getQuantity());
                }
                newStock = previousStock - request.getQuantity();
                break;
            case ADJUSTMENT:
                newStock = request.getQuantity(); // Direct set for adjustments
                break;
            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Invalid movement type: " + request.getMovementType());
        }

        // Update product stock
        product.setCurrentStock(newStock);
        product.updateStockStatus();
        productRepository.save(product);

        // Create stock movement record
        StockMovement movement = StockMovement.builder()
                .product(product)
                .movementType(request.getMovementType())
                .quantity(request.getQuantity())
                .previousStock(previousStock)
                .newStock(newStock)
                .reason(request.getReason())
                .referenceNumber(request.getReferenceNumber())
                .performedBy(currentUser)
                .build();

        movement = stockMovementRepository.save(movement);

        auditLogService.logAction(AuditAction.STOCK_UPDATE, "Product", product.getId(),
                "stock:" + previousStock + "->" + newStock);

        return toMovementDTO(movement);
    }

    public Page<StockMovementDTO> getStockMovements(Long productId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<StockMovement> movements = stockMovementRepository.findByProductId(productId, pageable);
        return movements.map(this::toMovementDTO);
    }

    public Page<StockMovementDTO> getStockMovementsByVendor(Long vendorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<StockMovement> movements = stockMovementRepository.findByVendorId(vendorId, pageable);
        return movements.map(this::toMovementDTO);
    }

    @Transactional
    public ReorderRequestDTO createReorderRequest(ReorderCreateRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + request.getProductId()));

        User currentUser = getCurrentUser();

        ReorderRequest reorderRequest = ReorderRequest.builder()
                .product(product)
                .requestedQuantity(request.getRequestedQuantity())
                .status(ReorderStatus.PENDING)
                .requestedBy(currentUser)
                .notes(request.getNotes())
                .build();

        reorderRequest = reorderRequestRepository.save(reorderRequest);

        auditLogService.logAction(AuditAction.REORDER_REQUEST, "Product", product.getId(),
                "reorder_qty:" + request.getRequestedQuantity());

        return toReorderDTO(reorderRequest);
    }

    @Transactional
    public ReorderRequestDTO approveReorderRequest(Long requestId) {
        ReorderRequest request = reorderRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Reorder request not found with id: " + requestId));

        if (request.getStatus() != ReorderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Can only approve pending requests");
        }

        User currentUser = getCurrentUser();
        request.setStatus(ReorderStatus.APPROVED);
        request.setApprovedBy(currentUser);
        request.setApprovedAt(java.time.LocalDateTime.now());

        request = reorderRequestRepository.save(request);

        return toReorderDTO(request);
    }

    @Transactional
    public ReorderRequestDTO rejectReorderRequest(Long requestId, String reason) {
        ReorderRequest request = reorderRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Reorder request not found with id: " + requestId));

        if (request.getStatus() != ReorderStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Can only reject pending requests");
        }

        request.setStatus(ReorderStatus.REJECTED);
        request.setNotes(reason);

        request = reorderRequestRepository.save(request);

        return toReorderDTO(request);
    }

    @Transactional
    public ReorderRequestDTO fulfillReorderRequest(Long requestId) {
        ReorderRequest request = reorderRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Reorder request not found with id: " + requestId));

        if (request.getStatus() != ReorderStatus.APPROVED && request.getStatus() != ReorderStatus.ORDERED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Can only fulfill approved or ordered requests");
        }

        // Update stock
        StockUpdateRequest stockUpdate = StockUpdateRequest.builder()
                .productId(request.getProduct().getId())
                .movementType(MovementType.RESTOCK)
                .quantity(request.getRequestedQuantity())
                .reason("Reorder request fulfilled: " + requestId)
                .referenceNumber("REORDER-" + requestId)
                .build();

        updateStock(stockUpdate);

        request.setStatus(ReorderStatus.FULFILLED);
        request.setFulfilledAt(java.time.LocalDateTime.now());

        request = reorderRequestRepository.save(request);

        return toReorderDTO(request);
    }

    public Page<ReorderRequestDTO> getReorderRequests(ReorderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"));
        Page<ReorderRequest> requests;

        if (status != null) {
            requests = reorderRequestRepository.findByStatus(status, pageable);
        } else {
            requests = reorderRequestRepository.findAll(pageable);
        }

        return requests.map(this::toReorderDTO);
    }

    public Page<ReorderRequestDTO> getReorderRequestsByVendor(Long vendorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "requestedAt"));
        Page<ReorderRequest> requests = reorderRequestRepository.findByVendorId(vendorId, pageable);
        return requests.map(this::toReorderDTO);
    }

    public InventoryStatsDTO getInventoryStats() {
        Long totalProducts = productRepository.count();
        Long inStockCount = productRepository.countByStockStatus(StockStatus.IN_STOCK);
        Long lowStockCount = productRepository.countByStockStatus(StockStatus.LOW_STOCK);
        Long outOfStockCount = productRepository.countByStockStatus(StockStatus.OUT_OF_STOCK);

        double healthPercentage = totalProducts > 0
                ? (inStockCount.doubleValue() / totalProducts.doubleValue()) * 100
                : 0;

        Long pendingReorders = reorderRequestRepository.countByStatus(ReorderStatus.PENDING);

        List<ProductDTO> criticalProducts = productRepository.findOutOfStockProducts().stream()
                .limit(10)
                .map(this::toProductDTO)
                .toList();

        return InventoryStatsDTO.builder()
                .totalProducts(totalProducts)
                .inStockCount(inStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .stockHealthPercentage(healthPercentage)
                .pendingReorders(pendingReorders.intValue())
                .criticalStockProducts(criticalProducts)
                .build();
    }

    public VendorStatsDTO getVendorStats(Long vendorId) {
        User vendor = userRepository.findById(vendorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vendor not found with id: " + vendorId));

        List<Product> vendorProducts = productRepository.findByVendorId(vendorId);

        long inStockCount = vendorProducts.stream()
                .filter(p -> p.getStockStatus() == StockStatus.IN_STOCK).count();
        long lowStockCount = vendorProducts.stream()
                .filter(p -> p.getStockStatus() == StockStatus.LOW_STOCK).count();
        long outOfStockCount = vendorProducts.stream()
                .filter(p -> p.getStockStatus() == StockStatus.OUT_OF_STOCK).count();

        BigDecimal totalValue = vendorProducts.stream()
                .filter(p -> p.getUnitPrice() != null)
                .map(p -> p.getUnitPrice().multiply(BigDecimal.valueOf(p.getCurrentStock())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<ReorderRequest> pendingRequests = reorderRequestRepository
                .findByVendorIdAndStatus(vendorId, ReorderStatus.PENDING);

        List<ProductDTO> lowStockProducts = vendorProducts.stream()
                .filter(p -> p.getStockStatus() == StockStatus.LOW_STOCK ||
                        p.getStockStatus() == StockStatus.OUT_OF_STOCK)
                .map(this::toProductDTO)
                .toList();

        return VendorStatsDTO.builder()
                .vendorId(vendorId)
                .vendorName(vendor.getUsername())
                .totalProducts((long) vendorProducts.size())
                .inStockCount(inStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .totalInventoryValue(totalValue)
                .pendingReorders(pendingRequests.size())
                .lowStockProducts(lowStockProducts)
                .pendingReorderRequests(pendingRequests.stream().map(this::toReorderDTO).toList())
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
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

    private ReorderRequestDTO toReorderDTO(ReorderRequest request) {
        return ReorderRequestDTO.builder()
                .id(request.getId())
                .productId(request.getProduct().getId())
                .productName(request.getProduct().getName())
                .productSku(request.getProduct().getSku())
                .vendorName(request.getProduct().getVendor().getUsername())
                .currentStock(request.getProduct().getCurrentStock())
                .reorderLevel(request.getProduct().getReorderLevel())
                .requestedQuantity(request.getRequestedQuantity())
                .status(request.getStatus())
                .requestedById(request.getRequestedBy().getId())
                .requestedByName(request.getRequestedBy().getUsername())
                .approvedById(request.getApprovedBy() != null ? request.getApprovedBy().getId() : null)
                .approvedByName(request.getApprovedBy() != null ? request.getApprovedBy().getUsername() : null)
                .requestedAt(request.getRequestedAt())
                .approvedAt(request.getApprovedAt())
                .fulfilledAt(request.getFulfilledAt())
                .notes(request.getNotes())
                .build();
    }

    private ProductDTO toProductDTO(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .vendorId(product.getVendor().getId())
                .vendorName(product.getVendor().getUsername())
                .currentStock(product.getCurrentStock())
                .reorderLevel(product.getReorderLevel())
                .reorderQuantity(product.getReorderQuantity())
                .unitPrice(product.getUnitPrice())
                .costPrice(product.getCostPrice())
                .stockStatus(product.getStockStatus())
                .imageUrl(product.getImageUrl())
                .unit(product.getUnit())
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
