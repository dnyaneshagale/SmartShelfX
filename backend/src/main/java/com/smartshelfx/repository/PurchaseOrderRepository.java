package com.smartshelfx.repository;

import com.smartshelfx.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByVendorId(Long vendorId);
    List<PurchaseOrder> findByStatus(PurchaseOrder.Status status);
    List<PurchaseOrder> findByProductId(Long productId);
    List<PurchaseOrder> findByProductIdAndStatus(Long productId, PurchaseOrder.Status status);
}
