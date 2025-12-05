package com.infosys.smartshelfx.service;

import com.infosys.smartshelfx.dtos.CsvImportResult;
import com.infosys.smartshelfx.dtos.ProductCreateRequest;
import com.infosys.smartshelfx.dtos.ProductDTO;
import com.infosys.smartshelfx.dtos.StockUpdateRequest;
import com.infosys.smartshelfx.entity.Category;
import com.infosys.smartshelfx.entity.MovementType;
import com.infosys.smartshelfx.entity.Product;
import com.infosys.smartshelfx.entity.User;
import com.infosys.smartshelfx.repository.CategoryRepository;
import com.infosys.smartshelfx.repository.ProductRepository;
import com.infosys.smartshelfx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CsvService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final InventoryService inventoryService;

    @Transactional
    public CsvImportResult importProducts(MultipartFile file, Long vendorId) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            String[] headers = null;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                if (lineNumber == 1) {
                    headers = values;
                    continue;
                }

                totalRows++;

                try {
                    ProductCreateRequest request = parseProductFromCsv(headers, values, vendorId);
                    productService.createProduct(request);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + lineNumber + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Error reading CSV file", e);
            errors.add("Error reading file: " + e.getMessage());
        }

        return CsvImportResult.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failureCount(totalRows - successCount)
                .errors(errors)
                .warnings(warnings)
                .build();
    }

    @Transactional
    public CsvImportResult importStockUpdates(MultipartFile file) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        int successCount = 0;
        int totalRows = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            String[] headers = null;
            int lineNumber = 0;

            while ((line = reader.readLine()) != null) {
                lineNumber++;
                String[] values = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                if (lineNumber == 1) {
                    headers = values;
                    continue;
                }

                totalRows++;

                try {
                    StockUpdateRequest request = parseStockUpdateFromCsv(headers, values);
                    inventoryService.updateStock(request);
                    successCount++;
                } catch (Exception e) {
                    errors.add("Row " + lineNumber + ": " + e.getMessage());
                }
            }
        } catch (IOException e) {
            log.error("Error reading CSV file", e);
            errors.add("Error reading file: " + e.getMessage());
        }

        return CsvImportResult.builder()
                .totalRows(totalRows)
                .successCount(successCount)
                .failureCount(totalRows - successCount)
                .errors(errors)
                .warnings(warnings)
                .build();
    }

    public byte[] exportProducts(Long vendorId) {
        List<Product> products;
        if (vendorId != null) {
            products = productRepository.findByVendorId(vendorId);
        } else {
            products = productRepository.findAll();
        }

        StringBuilder csv = new StringBuilder();
        csv.append(
                "SKU,Name,Description,Category,Vendor,CurrentStock,ReorderLevel,ReorderQuantity,UnitPrice,CostPrice,Unit,StockStatus,IsActive\n");

        for (Product product : products) {
            csv.append(escapeCsv(product.getSku())).append(",");
            csv.append(escapeCsv(product.getName())).append(",");
            csv.append(escapeCsv(product.getDescription())).append(",");
            csv.append(escapeCsv(product.getCategory().getName())).append(",");
            csv.append(escapeCsv(product.getVendor().getUsername())).append(",");
            csv.append(product.getCurrentStock()).append(",");
            csv.append(product.getReorderLevel()).append(",");
            csv.append(product.getReorderQuantity()).append(",");
            csv.append(product.getUnitPrice() != null ? product.getUnitPrice() : "").append(",");
            csv.append(product.getCostPrice() != null ? product.getCostPrice() : "").append(",");
            csv.append(escapeCsv(product.getUnit())).append(",");
            csv.append(product.getStockStatus()).append(",");
            csv.append(product.getIsActive()).append("\n");
        }

        return csv.toString().getBytes();
    }

    public byte[] exportProductTemplate() {
        StringBuilder csv = new StringBuilder();
        csv.append(
                "SKU,Name,Description,CategoryId,VendorId,CurrentStock,ReorderLevel,ReorderQuantity,UnitPrice,CostPrice,Unit\n");
        csv.append("SAMPLE-001,Sample Product,Product description,1,1,100,20,50,29.99,15.00,pieces\n");
        return csv.toString().getBytes();
    }

    public byte[] exportStockUpdateTemplate() {
        StringBuilder csv = new StringBuilder();
        csv.append("ProductId,MovementType,Quantity,Reason,ReferenceNumber\n");
        csv.append("1,RECEIVING,100,Initial stock,PO-001\n");
        return csv.toString().getBytes();
    }

    private ProductCreateRequest parseProductFromCsv(String[] headers, String[] values, Long defaultVendorId) {
        ProductCreateRequest.ProductCreateRequestBuilder builder = ProductCreateRequest.builder();

        for (int i = 0; i < headers.length && i < values.length; i++) {
            String header = headers[i].trim().toLowerCase();
            String value = values[i].trim().replaceAll("^\"|\"$", "");

            switch (header) {
                case "sku":
                    builder.sku(value);
                    break;
                case "name":
                    builder.name(value);
                    break;
                case "description":
                    builder.description(value);
                    break;
                case "categoryid":
                    builder.categoryId(Long.parseLong(value));
                    break;
                case "vendorid":
                    builder.vendorId(defaultVendorId != null ? defaultVendorId : Long.parseLong(value));
                    break;
                case "currentstock":
                    builder.currentStock(Integer.parseInt(value));
                    break;
                case "reorderlevel":
                    builder.reorderLevel(Integer.parseInt(value));
                    break;
                case "reorderquantity":
                    builder.reorderQuantity(Integer.parseInt(value));
                    break;
                case "unitprice":
                    if (!value.isEmpty()) {
                        builder.unitPrice(new BigDecimal(value));
                    }
                    break;
                case "costprice":
                    if (!value.isEmpty()) {
                        builder.costPrice(new BigDecimal(value));
                    }
                    break;
                case "unit":
                    builder.unit(value);
                    break;
            }
        }

        // Set default vendor if provided
        if (defaultVendorId != null) {
            builder.vendorId(defaultVendorId);
        }

        return builder.build();
    }

    private StockUpdateRequest parseStockUpdateFromCsv(String[] headers, String[] values) {
        StockUpdateRequest.StockUpdateRequestBuilder builder = StockUpdateRequest.builder();

        for (int i = 0; i < headers.length && i < values.length; i++) {
            String header = headers[i].trim().toLowerCase();
            String value = values[i].trim().replaceAll("^\"|\"$", "");

            switch (header) {
                case "productid":
                    builder.productId(Long.parseLong(value));
                    break;
                case "movementtype":
                    builder.movementType(MovementType.valueOf(value.toUpperCase()));
                    break;
                case "quantity":
                    builder.quantity(Integer.parseInt(value));
                    break;
                case "reason":
                    builder.reason(value);
                    break;
                case "referencenumber":
                    builder.referenceNumber(value);
                    break;
            }
        }

        return builder.build();
    }

    private String escapeCsv(String value) {
        if (value == null) {
            return "";
        }
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
