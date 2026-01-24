package com.smartshelfx.repository;

import com.smartshelfx.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);
    
    @Query("SELECT p FROM Product p WHERE p.vendor.id = :vendorId")
    List<Product> findByVendorId(@Param("vendorId") Long vendorId);
    
    @Query("SELECT p FROM Product p WHERE p.currentStock > 0 AND p.currentStock <= p.reorderLevel")
    List<Product> findLowStockProducts();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock > 0 AND p.currentStock <= p.reorderLevel")
    Long countLowStockProducts();
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.currentStock = 0")
    Long countOutOfStockProducts();
    
    @Query("SELECT p FROM Product p WHERE p.currentStock = 0")
    List<Product> findOutOfStockProducts();
}
