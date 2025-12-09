package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.Product;
import com.infosys.smartshelfx.entity.StockStatus;
import com.infosys.smartshelfx.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

        Optional<Product> findBySku(String sku);

        boolean existsBySku(String sku);

        List<Product> findByVendor(User vendor);

        Page<Product> findByVendor(User vendor, Pageable pageable);

        List<Product> findByVendorId(Long vendorId);

        Page<Product> findByVendorId(Long vendorId, Pageable pageable);

        List<Product> findByCategoryId(Long categoryId);

        Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

        List<Product> findByStockStatus(StockStatus stockStatus);

        Page<Product> findByStockStatus(StockStatus stockStatus, Pageable pageable);

        @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel")
        List<Product> findLowStockProducts();

        @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel AND p.vendor.id = :vendorId")
        List<Product> findLowStockProductsByVendor(@Param("vendorId") Long vendorId);

        @Query("SELECT p FROM Product p WHERE p.stockStatus = 'OUT_OF_STOCK'")
        List<Product> findOutOfStockProducts();

        @Query("SELECT COUNT(p) FROM Product p WHERE p.stockStatus = :status")
        Long countByStockStatus(@Param("status") StockStatus status);

        @Query("SELECT COUNT(p) FROM Product p WHERE p.vendor.id = :vendorId")
        Long countByVendorId(@Param("vendorId") Long vendorId);

        @Query("SELECT p FROM Product p WHERE " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:vendorId IS NULL OR p.vendor.id = :vendorId) AND " +
                        "(:stockStatus IS NULL OR p.stockStatus = :stockStatus) AND " +
                        "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        Page<Product> findWithFilters(
                        @Param("categoryId") Long categoryId,
                        @Param("vendorId") Long vendorId,
                        @Param("stockStatus") StockStatus stockStatus,
                        @Param("searchTerm") String searchTerm,
                        Pageable pageable);

        @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId AND " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:stockStatus IS NULL OR p.stockStatus = :stockStatus) AND " +
                        "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        Page<Product> findByVendorWithFilters(
                        @Param("vendorId") Long vendorId,
                        @Param("categoryId") Long categoryId,
                        @Param("stockStatus") StockStatus stockStatus,
                        @Param("searchTerm") String searchTerm,
                        Pageable pageable);

        @Query("SELECT p FROM Product p WHERE p.createdBy = :createdBy AND " +
                        "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
                        "(:vendorId IS NULL OR p.vendor.id = :vendorId) AND " +
                        "(:stockStatus IS NULL OR p.stockStatus = :stockStatus) AND " +
                        "(:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
        Page<Product> findByCreatedByWithFilters(
                        @Param("createdBy") Long createdBy,
                        @Param("categoryId") Long categoryId,
                        @Param("vendorId") Long vendorId,
                        @Param("stockStatus") StockStatus stockStatus,
                        @Param("searchTerm") String searchTerm,
                        Pageable pageable);

        @Query("SELECT p FROM Product p WHERE p.createdBy = :createdBy AND p.currentStock <= p.reorderLevel")
        List<Product> findLowStockProductsByCreatedBy(@Param("createdBy") Long createdBy);

        @Query("SELECT p FROM Product p WHERE p.createdBy = :createdBy AND p.stockStatus = 'OUT_OF_STOCK'")
        List<Product> findOutOfStockProductsByCreatedBy(@Param("createdBy") Long createdBy);

        // Additional methods for scheduling and analytics
        List<Product> findByCurrentStockLessThanEqual(int currentStock);

        List<Product> findByIsActiveTrue();

        @Query("SELECT p FROM Product p WHERE p.currentStock <= p.reorderLevel AND p.isActive = true")
        List<Product> findProductsNeedingRestock();

        @Query("SELECT p FROM Product p WHERE p.category.id = :categoryId AND p.isActive = true")
        List<Product> findActiveByCategoryId(@Param("categoryId") Long categoryId);

        @Query("SELECT p FROM Product p WHERE p.stockStatus = :stockStatus AND p.isActive = true")
        List<Product> findActiveByStockStatus(@Param("stockStatus") StockStatus stockStatus);

        @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
        Long countActiveProducts();

        @Query("SELECT SUM(p.currentStock) FROM Product p WHERE p.isActive = true")
        Long sumTotalQuantity();
}