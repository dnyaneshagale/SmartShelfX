package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.AuditAction;
import com.infosys.smartshelfx.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId, Pageable pageable);

    Page<AuditLog> findByPerformedById(Long userId, Pageable pageable);

    Page<AuditLog> findByAction(AuditAction action, Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE a.performedAt BETWEEN :startDate AND :endDate ORDER BY a.performedAt DESC")
    Page<AuditLog> findByDateRange(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable);

    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:entityType IS NULL OR a.entityType = :entityType) AND " +
            "(:action IS NULL OR a.action = :action) AND " +
            "(:userId IS NULL OR a.performedBy.id = :userId) " +
            "ORDER BY a.performedAt DESC")
    Page<AuditLog> findWithFilters(
            @Param("entityType") String entityType,
            @Param("action") AuditAction action,
            @Param("userId") Long userId,
            Pageable pageable);

    List<AuditLog> findTop10ByOrderByPerformedAtDesc();
}
