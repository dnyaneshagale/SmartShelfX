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

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public Page<ProductDTO> getAllProducts(ProductFilterRequest filter) {
        Sort sort = Sort.by(
                filter.getSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
                filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> products = productRepository.findWithFilters(
                filter.getCategoryId(),
                filter.getVendorId(),
                filter.getStockStatus(),
                filter.getSearchTerm(),
                pageable);

        return products.map(this::toDTO);
    }

    public Page<ProductDTO> getProductsByVendor(Long vendorId, ProductFilterRequest filter) {
        Sort sort = Sort.by(
                filter.getSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
                filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> products = productRepository.findByVendorWithFilters(
                vendorId,
                filter.getCategoryId(),
                filter.getStockStatus(),
                filter.getSearchTerm(),
                pageable);

        return products.map(this::toDTO);
    }

    public Page<ProductDTO> getProductsByCreatedBy(Long createdBy, ProductFilterRequest filter) {
        Sort sort = Sort.by(
                filter.getSortDirection().equalsIgnoreCase("DESC") ? Sort.Direction.DESC : Sort.Direction.ASC,
                filter.getSortBy());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);

        Page<Product> products = productRepository.findByCreatedByWithFilters(
                createdBy,
                filter.getCategoryId(),
                filter.getVendorId(),
                filter.getStockStatus(),
                filter.getSearchTerm(),
                pageable);

        return products.map(this::toDTO);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));
        return toDTO(product);
    }

    public ProductDTO getProductBySku(String sku) {
        Product product = productRepository.findBySku(sku)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with SKU: " + sku));
        return toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductCreateRequest request) {
        // Validate SKU uniqueness
        if (productRepository.existsBySku(request.getSku())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Product already exists with SKU: " + request.getSku());
        }

        // Validate category
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id: " + request.getCategoryId()));

        // Validate vendor - allow VENDOR, ADMIN, or WAREHOUSEMANAGER
        User vendor = userRepository.findById(request.getVendorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Vendor not found with id: " + request.getVendorId()));

        if (vendor.getRole() != Role.VENDOR && vendor.getRole() != Role.ADMIN
                && vendor.getRole() != Role.WAREHOUSEMANAGER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User is not a valid vendor: " + request.getVendorId());
        }

        User currentUser = getCurrentUser();

        Product product = Product.builder()
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                .category(category)
                .vendor(vendor)
                .currentStock(request.getCurrentStock())
                .reorderLevel(request.getReorderLevel())
                .reorderQuantity(request.getReorderQuantity())
                .unitPrice(request.getUnitPrice())
                .costPrice(request.getCostPrice())
                .imageUrl(request.getImageUrl())
                .unit(request.getUnit())
                .isActive(true)
                .createdBy(currentUser != null ? currentUser.getId() : null)
                .build();

        product = productRepository.save(product);

        auditLogService.logAction(AuditAction.CREATE, "Product", product.getId(),
                null, product, "sku,name,category,vendor,stock");

        return toDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductUpdateRequest request, boolean isAdmin) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));

        StringBuilder changedFields = new StringBuilder();
        User currentUser = getCurrentUser();

        // Admin-only fields
        if (isAdmin) {
            if (request.getCategoryId() != null && !request.getCategoryId().equals(product.getCategory().getId())) {
                Category category = categoryRepository.findById(request.getCategoryId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Category not found with id: " + request.getCategoryId()));
                product.setCategory(category);
                changedFields.append("category,");
            }

            if (request.getVendorId() != null && !request.getVendorId().equals(product.getVendor().getId())) {
                User vendor = userRepository.findById(request.getVendorId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Vendor not found with id: " + request.getVendorId()));
                product.setVendor(vendor);
                changedFields.append("vendor,");
            }
        }

        // Common updatable fields
        if (request.getName() != null) {
            product.setName(request.getName());
            changedFields.append("name,");
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
            changedFields.append("description,");
        }
        if (request.getReorderLevel() != null) {
            product.setReorderLevel(request.getReorderLevel());
            changedFields.append("reorderLevel,");
        }
        if (request.getReorderQuantity() != null) {
            product.setReorderQuantity(request.getReorderQuantity());
            changedFields.append("reorderQuantity,");
        }
        if (request.getUnitPrice() != null) {
            product.setUnitPrice(request.getUnitPrice());
            changedFields.append("unitPrice,");
        }
        if (request.getCostPrice() != null) {
            product.setCostPrice(request.getCostPrice());
            changedFields.append("costPrice,");
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
            changedFields.append("imageUrl,");
        }
        if (request.getUnit() != null) {
            product.setUnit(request.getUnit());
            changedFields.append("unit,");
        }
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
            changedFields.append("isActive,");
        }

        product.setUpdatedBy(currentUser != null ? currentUser.getId() : null);
        product = productRepository.save(product);

        auditLogService.logAction(AuditAction.UPDATE, "Product", product.getId(),
                changedFields.toString());

        return toDTO(product);
    }

    @Transactional
    public ProductDTO updateProductForVendor(Long id, ProductUpdateRequest request, Long vendorId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));

        // Verify vendor owns this product
        if (!product.getVendor().getId().equals(vendorId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You don't have permission to update this product");
        }

        StringBuilder changedFields = new StringBuilder();
        User currentUser = getCurrentUser();

        // Vendor can only update limited fields
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
            changedFields.append("description,");
        }
        if (request.getUnitPrice() != null) {
            product.setUnitPrice(request.getUnitPrice());
            changedFields.append("unitPrice,");
        }
        if (request.getImageUrl() != null) {
            product.setImageUrl(request.getImageUrl());
            changedFields.append("imageUrl,");
        }

        product.setUpdatedBy(currentUser != null ? currentUser.getId() : null);
        product = productRepository.save(product);

        auditLogService.logAction(AuditAction.UPDATE, "Product", product.getId(),
                changedFields.toString());

        return toDTO(product);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id: " + id));

        auditLogService.logAction(AuditAction.DELETE, "Product", product.getId(),
                product, null, "deleted");

        productRepository.delete(product);
    }

    public List<ProductDTO> getLowStockProducts() {
        return productRepository.findLowStockProducts().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<ProductDTO> getLowStockProductsByVendor(Long vendorId) {
        return productRepository.findLowStockProductsByVendor(vendorId).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<ProductDTO> getLowStockProductsByCreatedBy(Long createdBy) {
        return productRepository.findLowStockProductsByCreatedBy(createdBy).stream()
                .map(this::toDTO)
                .toList();
    }

    public List<ProductDTO> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts().stream()
                .map(this::toDTO)
                .toList();
    }

    public List<ProductDTO> getOutOfStockProductsByCreatedBy(Long createdBy) {
        return productRepository.findOutOfStockProductsByCreatedBy(createdBy).stream()
                .map(this::toDTO)
                .toList();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String email = authentication.getName(); // This is now email after our login change
            return userRepository.findByEmail(email).orElse(null);
        }
        return null;
    }

    public ProductDTO toDTO(Product product) {
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
