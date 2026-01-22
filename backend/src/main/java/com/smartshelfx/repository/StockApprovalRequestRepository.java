package com.smartshelfx.repository;

import com.smartshelfx.model.StockApprovalRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockApprovalRequestRepository extends JpaRepository<StockApprovalRequest, Long> {
    List<StockApprovalRequest> findByVendorId(Long vendorId);
    List<StockApprovalRequest> findByStatus(StockApprovalRequest.Status status);
    List<StockApprovalRequest> findByVendorIdAndStatus(Long vendorId, StockApprovalRequest.Status status);
}
