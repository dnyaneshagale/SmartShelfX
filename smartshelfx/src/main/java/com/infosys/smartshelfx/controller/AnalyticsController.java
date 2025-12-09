package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.AnalyticsDTO;
import com.infosys.smartshelfx.service.AnalyticsService;
import com.infosys.smartshelfx.service.ReportExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Analytics Controller
 * - Inventory trends
 * - Sales comparison
 * - Top restocked items
 * - Report exports (Excel/PDF)
 */
@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'WAREHOUSEMANAGER')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final ReportExportService reportExportService;

    /**
     * Get inventory trends over time
     */
    @GetMapping("/inventory-trends")
    public ResponseEntity<List<AnalyticsDTO.InventoryTrend>> getInventoryTrends(
            @RequestParam(required = false) Long productId,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getInventoryTrends(productId, categoryId, days));
    }

    /**
     * Get sales comparison between periods
     */
    @GetMapping("/sales-comparison")
    public ResponseEntity<AnalyticsDTO.SalesComparison> getSalesComparison(
            @RequestParam String startDate1,
            @RequestParam String endDate1,
            @RequestParam String startDate2,
            @RequestParam String endDate2) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime start1 = LocalDate.parse(startDate1, formatter).atStartOfDay();
        LocalDateTime end1 = LocalDate.parse(endDate1, formatter).atTime(23, 59, 59);
        LocalDateTime start2 = LocalDate.parse(startDate2, formatter).atStartOfDay();
        LocalDateTime end2 = LocalDate.parse(endDate2, formatter).atTime(23, 59, 59);

        return ResponseEntity.ok(analyticsService.getSalesComparison(start1, end1, start2, end2));
    }

    /**
     * Get top restocked items
     */
    @GetMapping("/top-restocked")
    public ResponseEntity<List<AnalyticsDTO.TopRestockedItem>> getTopRestockedItems(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getTopRestockedItems(limit, days));
    }

    /**
     * Get category-wise inventory distribution
     */
    @GetMapping("/category-distribution")
    public ResponseEntity<List<AnalyticsDTO.CategoryDistribution>> getCategoryDistribution() {
        return ResponseEntity.ok(analyticsService.getCategoryDistribution());
    }

    /**
     * Get stock status summary
     */
    @GetMapping("/stock-status-summary")
    public ResponseEntity<Map<String, Long>> getStockStatusSummary() {
        return ResponseEntity.ok(analyticsService.getStockStatusSummary());
    }

    /**
     * Get vendor performance metrics
     */
    @GetMapping("/vendor-performance")
    public ResponseEntity<List<AnalyticsDTO.VendorPerformance>> getVendorPerformance(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(analyticsService.getVendorPerformance(days));
    }

    /**
     * Export inventory report as Excel
     */
    @GetMapping("/export/excel")
    public ResponseEntity<Resource> exportExcel(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus) {
        byte[] excelData = reportExportService.exportInventoryToExcel(categoryId, stockStatus);
        ByteArrayResource resource = new ByteArrayResource(excelData);

        String filename = "inventory_report_" + LocalDate.now() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
    }

    /**
     * Export inventory report as PDF
     */
    @GetMapping("/export/pdf")
    public ResponseEntity<Resource> exportPdf(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String stockStatus) {
        byte[] pdfData = reportExportService.exportInventoryToPdf(categoryId, stockStatus);
        ByteArrayResource resource = new ByteArrayResource(pdfData);

        String filename = "inventory_report_" + LocalDate.now() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfData.length)
                .body(resource);
    }

    /**
     * Export sales report as Excel
     */
    @GetMapping("/export/sales-excel")
    public ResponseEntity<Resource> exportSalesExcel(
            @RequestParam String startDate,
            @RequestParam String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime start = LocalDate.parse(startDate, formatter).atStartOfDay();
        LocalDateTime end = LocalDate.parse(endDate, formatter).atTime(23, 59, 59);

        byte[] excelData = reportExportService.exportSalesReportToExcel(start, end);
        ByteArrayResource resource = new ByteArrayResource(excelData);

        String filename = "sales_report_" + startDate + "_to_" + endDate + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(excelData.length)
                .body(resource);
    }

    /**
     * Export purchase orders report as PDF
     */
    @GetMapping("/export/purchase-orders-pdf")
    public ResponseEntity<Resource> exportPurchaseOrdersPdf(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "30") int days) {
        byte[] pdfData = reportExportService.exportPurchaseOrdersToPdf(status, days);
        ByteArrayResource resource = new ByteArrayResource(pdfData);

        String filename = "purchase_orders_report_" + LocalDate.now() + ".pdf";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(pdfData.length)
                .body(resource);
    }
}
