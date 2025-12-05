package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDTO {
    private Long id;
    private AuditAction action;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private String changedFields;
    private Long performedById;
    private String performedByName;
    private LocalDateTime performedAt;
    private String ipAddress;
}
