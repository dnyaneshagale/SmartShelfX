package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.MovementType;
import com.infosys.smartshelfx.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductId(Long productId);

    Page<StockMovement> findByProductId(Long productId, Pageable pageable);

    List<StockMovement> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<StockMovement> findByPerformedById(Long userId);

    Page<StockMovement> findByPerformedById(Long userId, Pageable pageable);

    List<StockMovement> findByMovementType(MovementType movementType);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.createdAt BETWEEN :startDate AND :endDate")
    List<StockMovement> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.product.vendor.id = :vendorId ORDER BY sm.createdAt DESC")
    Page<StockMovement> findByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT SUM(sm.quantity) FROM StockMovement sm WHERE sm.product.id = :productId AND sm.movementType IN :inTypes")
    Integer getTotalInbound(@Param("productId") Long productId, @Param("inTypes") List<MovementType> inTypes);

    @Query("SELECT SUM(sm.quantity) FROM StockMovement sm WHERE sm.product.id = :productId AND sm.movementType IN :outTypes")
    Integer getTotalOutbound(@Param("productId") Long productId, @Param("outTypes") List<MovementType> outTypes);

    List<StockMovement> findByProductIdAndCreatedAtBetween(Long productId, LocalDateTime startDate,
            LocalDateTime endDate);
}
