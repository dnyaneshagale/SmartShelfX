package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.ProductExpiry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProductExpiryRepository extends JpaRepository<ProductExpiry, Long> {

    List<ProductExpiry> findByProductIdOrderByExpiryDateAsc(Long productId);

    Page<ProductExpiry> findByProductId(Long productId, Pageable pageable);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.expiryDate <= :date AND pe.isExpired = false")
    List<ProductExpiry> findExpiredItems(@Param("date") LocalDate date);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.expiryDate BETWEEN :today AND :alertDate " +
            "AND pe.alertSent = false AND pe.isExpired = false")
    List<ProductExpiry> findItemsNearingExpiry(
            @Param("today") LocalDate today,
            @Param("alertDate") LocalDate alertDate);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.product.vendor.id = :vendorId " +
            "AND pe.expiryDate BETWEEN :today AND :alertDate")
    List<ProductExpiry> findNearExpiryByVendor(
            @Param("vendorId") Long vendorId,
            @Param("today") LocalDate today,
            @Param("alertDate") LocalDate alertDate);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.batchNumber = :batchNumber")
    List<ProductExpiry> findByBatchNumber(@Param("batchNumber") String batchNumber);

    @Query("SELECT SUM(pe.quantity) FROM ProductExpiry pe WHERE pe.product.id = :productId " +
            "AND pe.isExpired = false AND pe.expiryDate > :today")
    Integer getTotalValidStock(@Param("productId") Long productId, @Param("today") LocalDate today);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.isExpired = false ORDER BY pe.expiryDate ASC")
    Page<ProductExpiry> findAllValidOrderByExpiryDate(Pageable pageable);

    @Query("SELECT pe FROM ProductExpiry pe WHERE pe.expiryDate BETWEEN :startDate AND :endDate AND pe.alertSent = false")
    List<ProductExpiry> findByExpiryDateBetweenAndNotifiedFalse(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
