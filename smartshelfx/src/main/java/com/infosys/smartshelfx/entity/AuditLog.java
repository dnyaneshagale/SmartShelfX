package com.infosys.smartshelfx.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "audit_logs")
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Column(nullable = false)
    private String entityType; // e.g., "Product", "Category", "User"

    @Column(nullable = false)
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String oldValue; // JSON representation of old values

    @Column(columnDefinition = "TEXT")
    private String newValue; // JSON representation of new values

    @Column(columnDefinition = "TEXT")
    private String changedFields; // Comma-separated list of changed fields

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    private String ipAddress;

    @PrePersist
    protected void onCreate() {
        performedAt = LocalDateTime.now();
    }
}
