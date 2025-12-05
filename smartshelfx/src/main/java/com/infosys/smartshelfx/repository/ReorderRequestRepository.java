package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.ReorderRequest;
import com.infosys.smartshelfx.entity.ReorderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReorderRequestRepository extends JpaRepository<ReorderRequest, Long> {

    List<ReorderRequest> findByProductId(Long productId);

    Page<ReorderRequest> findByStatus(ReorderStatus status, Pageable pageable);

    List<ReorderRequest> findByRequestedById(Long userId);

    Page<ReorderRequest> findByRequestedById(Long userId, Pageable pageable);

    @Query("SELECT r FROM ReorderRequest r WHERE r.product.vendor.id = :vendorId")
    Page<ReorderRequest> findByVendorId(@Param("vendorId") Long vendorId, Pageable pageable);

    @Query("SELECT r FROM ReorderRequest r WHERE r.product.vendor.id = :vendorId AND r.status = :status")
    List<ReorderRequest> findByVendorIdAndStatus(@Param("vendorId") Long vendorId,
            @Param("status") ReorderStatus status);

    @Query("SELECT COUNT(r) FROM ReorderRequest r WHERE r.status = :status")
    Long countByStatus(@Param("status") ReorderStatus status);

    @Query("SELECT r FROM ReorderRequest r WHERE r.status IN :statuses ORDER BY r.requestedAt DESC")
    Page<ReorderRequest> findByStatusIn(@Param("statuses") List<ReorderStatus> statuses, Pageable pageable);
}
