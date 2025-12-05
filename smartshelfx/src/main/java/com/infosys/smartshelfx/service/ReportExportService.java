package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.AnalyticsDTO;
import com.infosys.smartshelfx.entity.*;
import com.infosys.smartshelfx.repository.*;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Report Export Service
 * - Generate Excel reports
 * - Prepare PDF data
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportExportService {

    private final ProductRepository productRepository;
    private final StockMovementRepository stockMovementRepository;
    private final SalesHistoryRepository salesHistoryRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final AnalyticsService analyticsService;

    /**
     * Export inventory report to Excel
     */
    public void exportInventoryReportToExcel(HttpServletResponse response, LocalDate startDate, LocalDate endDate)
            throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=inventory_report_" + LocalDate.now() + ".xlsx");

        try (Workbook workbook = new XSSFWorkbook(); OutputStream out = response.getOutputStream()) {

            // Create styles
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // Sheet 1: Summary
            createSummarySheet(workbook, headerStyle, startDate, endDate);

            // Sheet 2: Products
            createProductsSheet(workbook, headerStyle, currencyStyle);

            // Sheet 3: Stock Movements
            createStockMovementsSheet(workbook, headerStyle, dateStyle, startDate, endDate);

            // Sheet 4: Sales
            createSalesSheet(workbook, headerStyle, dateStyle, currencyStyle, startDate, endDate);

            workbook.write(out);
            log.info("Inventory report exported successfully");
        }
    }

    /**
     * Export analytics report to Excel
     */
    public void exportAnalyticsReportToExcel(HttpServletResponse response, LocalDate startDate, LocalDate endDate)
            throws IOException {

        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition",
                "attachment; filename=analytics_report_" + LocalDate.now() + ".xlsx");

        AnalyticsDTO analytics = analyticsService.getAnalyticsDashboard(startDate, endDate);

        try (Workbook workbook = new XSSFWorkbook(); OutputStream out = response.getOutputStream()) {

            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            // Sheet 1: Overview
            createOverviewSheet(workbook, headerStyle, currencyStyle, analytics);

            // Sheet 2: Sales Trend
            createTrendSheet(workbook, headerStyle, currencyStyle, "Sales Trend", analytics.getSalesTrend());

            // Sheet 3: Top Products
            createTopItemsSheet(workbook, headerStyle, "Top Selling Products", analytics.getTopSellingProducts());

            // Sheet 4: Category Distribution
            createCategorySheet(workbook, headerStyle, currencyStyle, analytics);

            workbook.write(out);
            log.info("Analytics report exported successfully");
        }
    }

    /**
     * Get report data for PDF generation (to be used by frontend with jsPDF)
     */
    public Map<String, Object> getReportDataForPDF(LocalDate startDate, LocalDate endDate) {
        return analyticsService.prepareExcelExportData(startDate, endDate);
    }

    private void createSummarySheet(Workbook workbook, CellStyle headerStyle,
            LocalDate startDate, LocalDate endDate) {
        Sheet sheet = workbook.createSheet("Summary");
        AnalyticsDTO analytics = analyticsService.getAnalyticsDashboard(startDate, endDate);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Inventory Report Summary");
        titleCell.setCellStyle(headerStyle);

        // Date range
        Row dateRow = sheet.createRow(rowNum++);
        dateRow.createCell(0).setCellValue("Report Period:");
        dateRow.createCell(1).setCellValue(startDate + " to " + endDate);

        rowNum++; // Empty row

        // Overview stats
        String[][] stats = {
                { "Total Products", String.valueOf(analytics.getTotalProducts()) },
                { "In Stock", String.valueOf(analytics.getInStockCount()) },
                { "Low Stock", String.valueOf(analytics.getLowStockCount()) },
                { "Out of Stock", String.valueOf(analytics.getOutOfStockCount()) },
                { "Stock Health %", String.format("%.1f%%", analytics.getStockHealthPercentage()) },
                { "Total Inventory Value", "$" + analytics.getTotalInventoryValue() },
                { "Total Sales", "$" + analytics.getTotalSalesAmount() },
                { "Pending Reorders", String.valueOf(analytics.getPendingReorders()) }
        };

        for (String[] stat : stats) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(stat[0]);
            row.createCell(1).setCellValue(stat[1]);
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createProductsSheet(Workbook workbook, CellStyle headerStyle, CellStyle currencyStyle) {
        Sheet sheet = workbook.createSheet("Products");
        List<Product> products = productRepository.findAll();

        // Header
        String[] headers = { "SKU", "Name", "Category", "Vendor", "Current Stock",
                "Reorder Level", "Unit Price", "Status" };
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data
        int rowNum = 1;
        for (Product product : products) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(product.getSku());
            row.createCell(1).setCellValue(product.getName());
            row.createCell(2).setCellValue(product.getCategory().getName());
            row.createCell(3).setCellValue(product.getVendor().getUsername());
            row.createCell(4).setCellValue(product.getCurrentStock());
            row.createCell(5).setCellValue(product.getReorderLevel());

            Cell priceCell = row.createCell(6);
            if (product.getUnitPrice() != null) {
                priceCell.setCellValue(product.getUnitPrice().doubleValue());
                priceCell.setCellStyle(currencyStyle);
            }

            row.createCell(7).setCellValue(product.getStockStatus().toString());
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createStockMovementsSheet(Workbook workbook, CellStyle headerStyle,
            CellStyle dateStyle, LocalDate startDate, LocalDate endDate) {
        Sheet sheet = workbook.createSheet("Stock Movements");
        List<StockMovement> movements = stockMovementRepository.findByDateRange(
                startDate.atStartOfDay(), endDate.plusDays(1).atStartOfDay());

        // Header
        String[] headers = { "Date", "Product SKU", "Product Name", "Type",
                "Quantity", "Previous Stock", "New Stock", "Handler", "Reference" };
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data
        int rowNum = 1;
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (StockMovement movement : movements) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(movement.getCreatedAt().format(formatter));
            row.createCell(1).setCellValue(movement.getProduct().getSku());
            row.createCell(2).setCellValue(movement.getProduct().getName());
            row.createCell(3).setCellValue(movement.getMovementType().toString());
            row.createCell(4).setCellValue(movement.getQuantity());
            row.createCell(5).setCellValue(movement.getPreviousStock());
            row.createCell(6).setCellValue(movement.getNewStock());
            row.createCell(7).setCellValue(
                    movement.getPerformedBy() != null ? movement.getPerformedBy().getUsername() : "");
            row.createCell(8).setCellValue(
                    movement.getReferenceNumber() != null ? movement.getReferenceNumber() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createSalesSheet(Workbook workbook, CellStyle headerStyle,
            CellStyle dateStyle, CellStyle currencyStyle,
            LocalDate startDate, LocalDate endDate) {
        Sheet sheet = workbook.createSheet("Sales");

        // Header
        String[] headers = { "Date", "Product SKU", "Product Name", "Quantity",
                "Unit Price", "Total Amount", "Order Reference", "Customer" };
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Note: In a real implementation, you'd filter by date range
        List<SalesHistory> sales = salesHistoryRepository.findAll();

        int rowNum = 1;
        for (SalesHistory sale : sales) {
            if (sale.getSaleDate().isBefore(startDate) || sale.getSaleDate().isAfter(endDate)) {
                continue;
            }

            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(sale.getSaleDate().toString());
            row.createCell(1).setCellValue(sale.getProduct().getSku());
            row.createCell(2).setCellValue(sale.getProduct().getName());
            row.createCell(3).setCellValue(sale.getQuantity());

            if (sale.getUnitPrice() != null) {
                Cell priceCell = row.createCell(4);
                priceCell.setCellValue(sale.getUnitPrice().doubleValue());
                priceCell.setCellStyle(currencyStyle);
            }

            if (sale.getTotalAmount() != null) {
                Cell totalCell = row.createCell(5);
                totalCell.setCellValue(sale.getTotalAmount().doubleValue());
                totalCell.setCellStyle(currencyStyle);
            }

            row.createCell(6).setCellValue(sale.getOrderReference() != null ? sale.getOrderReference() : "");
            row.createCell(7).setCellValue(sale.getCustomerReference() != null ? sale.getCustomerReference() : "");
        }

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createOverviewSheet(Workbook workbook, CellStyle headerStyle,
            CellStyle currencyStyle, AnalyticsDTO analytics) {
        Sheet sheet = workbook.createSheet("Overview");

        int rowNum = 0;
        Row titleRow = sheet.createRow(rowNum++);
        titleRow.createCell(0).setCellValue("Analytics Overview");

        rowNum++; // Empty row

        String[][] metrics = {
                { "Total Products", String.valueOf(analytics.getTotalProducts()) },
                { "Total Categories", String.valueOf(analytics.getTotalCategories()) },
                { "Total Vendors", String.valueOf(analytics.getTotalVendors()) },
                { "In Stock Products", String.valueOf(analytics.getInStockCount()) },
                { "Low Stock Products", String.valueOf(analytics.getLowStockCount()) },
                { "Out of Stock Products", String.valueOf(analytics.getOutOfStockCount()) },
                { "Stock Health %", String.format("%.1f%%", analytics.getStockHealthPercentage()) },
                { "Total Sales", "$" + analytics.getTotalSalesAmount() },
                { "Total Purchases", "$" + analytics.getTotalPurchaseAmount() },
                { "Pending POs", String.valueOf(analytics.getPendingPurchaseOrders()) },
                { "Low Stock Alerts", String.valueOf(analytics.getLowStockAlerts()) },
                { "Expiry Alerts", String.valueOf(analytics.getExpiryAlerts()) }
        };

        for (String[] metric : metrics) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(metric[0]);
            row.createCell(1).setCellValue(metric[1]);
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
    }

    private void createTrendSheet(Workbook workbook, CellStyle headerStyle,
            CellStyle currencyStyle, String sheetName,
            List<AnalyticsDTO.TrendDataPoint> trend) {
        Sheet sheet = workbook.createSheet(sheetName);

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Date");
        headerRow.createCell(1).setCellValue("Value");
        headerRow.createCell(2).setCellValue("Quantity");

        if (trend != null) {
            int rowNum = 1;
            for (AnalyticsDTO.TrendDataPoint point : trend) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(point.getLabel());
                if (point.getValue() != null) {
                    row.createCell(1).setCellValue(point.getValue().doubleValue());
                }
                if (point.getQuantity() != null) {
                    row.createCell(2).setCellValue(point.getQuantity());
                }
            }
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
        sheet.autoSizeColumn(2);
    }

    private void createTopItemsSheet(Workbook workbook, CellStyle headerStyle,
            String sheetName, List<AnalyticsDTO.TopItemDTO> items) {
        Sheet sheet = workbook.createSheet(sheetName);

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Rank");
        headerRow.createCell(1).setCellValue("Name");
        headerRow.createCell(2).setCellValue("Quantity/Value");

        if (items != null) {
            int rowNum = 1;
            for (AnalyticsDTO.TopItemDTO item : items) {
                Row row = sheet.createRow(rowNum);
                row.createCell(0).setCellValue(rowNum);
                row.createCell(1).setCellValue(item.getName());
                if (item.getQuantity() != null) {
                    row.createCell(2).setCellValue(item.getQuantity());
                } else if (item.getValue() != null) {
                    row.createCell(2).setCellValue(item.getValue().doubleValue());
                }
                rowNum++;
            }
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
        sheet.autoSizeColumn(2);
    }

    private void createCategorySheet(Workbook workbook, CellStyle headerStyle,
            CellStyle currencyStyle, AnalyticsDTO analytics) {
        Sheet sheet = workbook.createSheet("Category Distribution");

        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Category");
        headerRow.createCell(1).setCellValue("Stock Count");
        headerRow.createCell(2).setCellValue("Value");

        int rowNum = 1;
        if (analytics.getStockByCategory() != null) {
            for (Map.Entry<String, Long> entry : analytics.getStockByCategory().entrySet()) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(entry.getKey());
                row.createCell(1).setCellValue(entry.getValue());

                if (analytics.getValueByCategory() != null) {
                    BigDecimal value = analytics.getValueByCategory().get(entry.getKey());
                    if (value != null) {
                        Cell valueCell = row.createCell(2);
                        valueCell.setCellValue(value.doubleValue());
                        valueCell.setCellStyle(currencyStyle);
                    }
                }
            }
        }

        sheet.autoSizeColumn(0);
        sheet.autoSizeColumn(1);
        sheet.autoSizeColumn(2);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createDateStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-mm-dd"));
        return style;
    }

    private CellStyle createCurrencyStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("$#,##0.00"));
        return style;
    }

    /**
     * Export inventory to Excel as byte array
     */
    public byte[] exportInventoryToExcel(Long categoryId, String stockStatus) {
        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);

            Sheet sheet = workbook.createSheet("Inventory");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "SKU", "Name", "Category", "Vendor", "Stock", "Reorder Level", "Unit Price",
                    "Status" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Get products with filters
            List<Product> products;
            if (categoryId != null) {
                products = productRepository.findByCategoryId(categoryId);
            } else if (stockStatus != null) {
                try {
                    StockStatus status = StockStatus.valueOf(stockStatus);
                    products = productRepository.findByStockStatus(status);
                } catch (IllegalArgumentException e) {
                    products = productRepository.findAll();
                }
            } else {
                products = productRepository.findAll();
            }

            int rowNum = 1;
            for (Product product : products) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(product.getSku());
                row.createCell(1).setCellValue(product.getName());
                row.createCell(2).setCellValue(product.getCategory() != null ? product.getCategory().getName() : "");
                row.createCell(3).setCellValue(product.getVendor() != null ? product.getVendor().getUsername() : "");
                row.createCell(4).setCellValue(product.getCurrentStock());
                row.createCell(5).setCellValue(product.getReorderLevel());

                Cell priceCell = row.createCell(6);
                if (product.getUnitPrice() != null) {
                    priceCell.setCellValue(product.getUnitPrice().doubleValue());
                    priceCell.setCellStyle(currencyStyle);
                }

                row.createCell(7).setCellValue(product.getStockStatus().name());
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export inventory to Excel", e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    /**
     * Export inventory to PDF as byte array
     */
    public byte[] exportInventoryToPdf(Long categoryId, String stockStatus) {
        // PDF generation using iText would require more complex setup
        // For now, return a simple PDF placeholder
        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();

            // Create a simple text-based PDF content
            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(baos);
            com.itextpdf.kernel.pdf.PdfDocument pdfDoc = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdfDoc);

            // Add title
            document.add(new com.itextpdf.layout.element.Paragraph("Inventory Report")
                    .setFontSize(20)
                    .setBold());
            document.add(new com.itextpdf.layout.element.Paragraph("Generated: " + LocalDate.now())
                    .setFontSize(12));
            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Create table
            float[] columnWidths = { 1, 2, 1, 1, 1, 1 };
            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(columnWidths);

            // Headers
            table.addHeaderCell("SKU");
            table.addHeaderCell("Name");
            table.addHeaderCell("Category");
            table.addHeaderCell("Stock");
            table.addHeaderCell("Reorder Level");
            table.addHeaderCell("Status");

            // Get products
            List<Product> products;
            if (categoryId != null) {
                products = productRepository.findByCategoryId(categoryId);
            } else if (stockStatus != null) {
                try {
                    StockStatus status = StockStatus.valueOf(stockStatus);
                    products = productRepository.findByStockStatus(status);
                } catch (IllegalArgumentException e) {
                    products = productRepository.findAll();
                }
            } else {
                products = productRepository.findAll();
            }

            for (Product product : products) {
                table.addCell(product.getSku());
                table.addCell(product.getName());
                table.addCell(product.getCategory() != null ? product.getCategory().getName() : "");
                table.addCell(String.valueOf(product.getCurrentStock()));
                table.addCell(String.valueOf(product.getReorderLevel()));
                table.addCell(product.getStockStatus().name());
            }

            document.add(table);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export inventory to PDF", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }

    /**
     * Export sales report to Excel as byte array
     */
    public byte[] exportSalesReportToExcel(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        try (Workbook workbook = new XSSFWorkbook()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle currencyStyle = createCurrencyStyle(workbook);
            CellStyle dateStyle = createDateStyle(workbook);

            Sheet sheet = workbook.createSheet("Sales Report");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = { "Date", "Product SKU", "Product Name", "Quantity", "Unit Price", "Total",
                    "Reference" };
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            List<SalesHistory> salesList = salesHistoryRepository.findBySaleDateBetween(
                    startDate.toLocalDate(), endDate.toLocalDate());

            int rowNum = 1;
            for (SalesHistory sale : salesList) {
                Row row = sheet.createRow(rowNum++);

                Cell dateCell = row.createCell(0);
                dateCell.setCellValue(sale.getSaleDate().toString());

                row.createCell(1).setCellValue(sale.getProduct() != null ? sale.getProduct().getSku() : "");
                row.createCell(2).setCellValue(sale.getProduct() != null ? sale.getProduct().getName() : "");
                row.createCell(3).setCellValue(sale.getQuantity());

                Cell priceCell = row.createCell(4);
                if (sale.getUnitPrice() != null) {
                    priceCell.setCellValue(sale.getUnitPrice().doubleValue());
                    priceCell.setCellStyle(currencyStyle);
                }

                Cell totalCell = row.createCell(5);
                if (sale.getTotalAmount() != null) {
                    totalCell.setCellValue(sale.getTotalAmount().doubleValue());
                    totalCell.setCellStyle(currencyStyle);
                }

                row.createCell(6).setCellValue(sale.getOrderReference() != null ? sale.getOrderReference() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            workbook.write(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Failed to export sales to Excel", e);
            throw new RuntimeException("Failed to generate Excel report", e);
        }
    }

    /**
     * Export purchase orders to PDF as byte array
     */
    public byte[] exportPurchaseOrdersToPdf(String status, int days) {
        try {
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();

            com.itextpdf.kernel.pdf.PdfWriter writer = new com.itextpdf.kernel.pdf.PdfWriter(baos);
            com.itextpdf.kernel.pdf.PdfDocument pdfDoc = new com.itextpdf.kernel.pdf.PdfDocument(writer);
            com.itextpdf.layout.Document document = new com.itextpdf.layout.Document(pdfDoc);

            document.add(new com.itextpdf.layout.element.Paragraph("Purchase Orders Report")
                    .setFontSize(20)
                    .setBold());
            document.add(new com.itextpdf.layout.element.Paragraph("Generated: " + LocalDate.now())
                    .setFontSize(12));
            document.add(new com.itextpdf.layout.element.Paragraph("Period: Last " + days + " days")
                    .setFontSize(12));
            document.add(new com.itextpdf.layout.element.Paragraph("\n"));

            // Table
            float[] columnWidths = { 1, 1, 2, 1, 1, 1 };
            com.itextpdf.layout.element.Table table = new com.itextpdf.layout.element.Table(columnWidths);

            table.addHeaderCell("PO Number");
            table.addHeaderCell("Date");
            table.addHeaderCell("Vendor");
            table.addHeaderCell("Total");
            table.addHeaderCell("Status");
            table.addHeaderCell("Items");

            java.time.LocalDateTime startDate = java.time.LocalDateTime.now().minusDays(days);
            java.time.LocalDateTime endDate = java.time.LocalDateTime.now();

            List<PurchaseOrder> orders;
            if (status != null && !status.isEmpty()) {
                try {
                    PurchaseOrderStatus poStatus = PurchaseOrderStatus.valueOf(status);
                    orders = purchaseOrderRepository.findByStatusOrderByCreatedAtDesc(poStatus);
                } catch (IllegalArgumentException e) {
                    orders = purchaseOrderRepository.findByCreatedAtBetween(startDate, endDate);
                }
            } else {
                orders = purchaseOrderRepository.findByCreatedAtBetween(startDate, endDate);
            }

            for (PurchaseOrder order : orders) {
                table.addCell(order.getPoNumber());
                table.addCell(order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : "");
                table.addCell(order.getVendor() != null ? order.getVendor().getUsername() : "");
                table.addCell(order.getTotalAmount() != null ? "$" + order.getTotalAmount().toString() : "");
                table.addCell(order.getStatus().name());
                table.addCell(String.valueOf(order.getItems() != null ? order.getItems().size() : 0));
            }

            document.add(table);
            document.close();

            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to export purchase orders to PDF", e);
            throw new RuntimeException("Failed to generate PDF report", e);
        }
    }
}
