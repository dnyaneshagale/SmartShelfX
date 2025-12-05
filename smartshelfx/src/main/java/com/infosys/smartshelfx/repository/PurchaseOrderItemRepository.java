package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, Long> {

    List<PurchaseOrderItem> findByPurchaseOrderId(Long purchaseOrderId);

    List<PurchaseOrderItem> findByProductId(Long productId);

    @Query("SELECT poi FROM PurchaseOrderItem poi WHERE poi.product.id = :productId " +
            "AND poi.purchaseOrder.status IN ('APPROVED', 'SENT', 'ACKNOWLEDGED')")
    List<PurchaseOrderItem> findPendingItemsByProductId(@Param("productId") Long productId);

    @Query("SELECT SUM(poi.quantity) FROM PurchaseOrderItem poi WHERE poi.product.id = :productId " +
            "AND poi.purchaseOrder.status IN ('APPROVED', 'SENT', 'ACKNOWLEDGED')")
    Integer getTotalPendingQuantityByProductId(@Param("productId") Long productId);
}
