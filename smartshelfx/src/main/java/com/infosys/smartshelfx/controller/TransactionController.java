package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.*;
import com.infosys.smartshelfx.entity.MovementType;
import com.infosys.smartshelfx.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Transaction Controller - Stock-In/Stock-Out Operations
 * - Record incoming shipments
 * - Record outgoing sales/dispatches
 * - Track stock movement history
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // ==================== STOCK-IN OPERATIONS ====================

    /**
     * Record stock-in (incoming shipment)
     */
    @PostMapping("/stock-in")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<StockMovementDTO> recordStockIn(@Valid @RequestBody StockInRequest request) {
        return ResponseEntity.ok(transactionService.recordStockIn(request));
    }

    /**
     * Batch stock-in for multiple products
     */
    @PostMapping("/stock-in/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<List<StockMovementDTO>> batchStockIn(@Valid @RequestBody List<StockInRequest> requests) {
        return ResponseEntity.ok(transactionService.batchStockIn(requests));
    }

    // ==================== STOCK-OUT OPERATIONS ====================

    /**
     * Record stock-out (sales/dispatch)
     */
    @PostMapping("/stock-out")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<StockMovementDTO> recordStockOut(@Valid @RequestBody StockOutRequest request) {
        return ResponseEntity.ok(transactionService.recordStockOut(request));
    }

    /**
     * Batch stock-out for multiple products
     */
    @PostMapping("/stock-out/batch")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<List<StockMovementDTO>> batchStockOut(@Valid @RequestBody List<StockOutRequest> requests) {
        return ResponseEntity.ok(transactionService.batchStockOut(requests));
    }

    // ==================== STOCK MOVEMENT HISTORY ====================

    /**
     * Get all stock movements with filters
     */
    @GetMapping("/movements")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<Page<StockMovementDTO>> getStockMovements(
            @RequestParam(required = false) MovementType type,
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long handlerId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(transactionService.getAllStockMovements(
                type, productId, handlerId, startDate, endDate, page, size));
    }

    /**
     * Get stock movements by date range
     */
    @GetMapping("/movements/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<List<StockMovementDTO>> getStockMovementsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        return ResponseEntity.ok(transactionService.getStockMovementsByDateRange(startDate, endDate));
    }

    // ==================== SALES HISTORY ====================

    /**
     * Get sales history
     */
    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
    public ResponseEntity<Page<SalesHistoryDTO>> getSalesHistory(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(transactionService.getSalesHistory(productId, startDate, endDate, page, size));
    }
}
