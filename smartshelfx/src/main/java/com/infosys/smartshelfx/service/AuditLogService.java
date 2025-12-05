package com.infosys.smartshelfx.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.smartshelfx.dtos.AuditLogDTO;
import com.infosys.smartshelfx.entity.AuditAction;
import com.infosys.smartshelfx.entity.AuditLog;
import com.infosys.smartshelfx.entity.User;
import com.infosys.smartshelfx.repository.AuditLogRepository;
import com.infosys.smartshelfx.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void logAction(AuditAction action, String entityType, Long entityId,
            Object oldValue, Object newValue, String changedFields) {
        try {
            User currentUser = getCurrentUser();
            if (currentUser == null) {
                log.warn("Could not determine current user for audit log");
                return;
            }

            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .oldValue(oldValue != null ? objectMapper.writeValueAsString(oldValue) : null)
                    .newValue(newValue != null ? objectMapper.writeValueAsString(newValue) : null)
                    .changedFields(changedFields)
                    .performedBy(currentUser)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (JsonProcessingException e) {
            log.error("Error serializing audit log values", e);
        }
    }

    @Transactional
    public void logAction(AuditAction action, String entityType, Long entityId, String changedFields) {
        logAction(action, entityType, entityId, null, null, changedFields);
    }

    public Page<AuditLogDTO> getAuditLogs(String entityType, AuditAction action,
            Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "performedAt"));
        Page<AuditLog> logs = auditLogRepository.findWithFilters(entityType, action, userId, pageable);
        return logs.map(this::toDTO);
    }

    public Page<AuditLogDTO> getAuditLogsByEntity(String entityType, Long entityId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "performedAt"));
        Page<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId, pageable);
        return logs.map(this::toDTO);
    }

    public List<AuditLogDTO> getRecentAuditLogs() {
        return auditLogRepository.findTop10ByOrderByPerformedAtDesc()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            return userRepository.findByUsername(username).orElse(null);
        }
        return null;
    }

    private AuditLogDTO toDTO(AuditLog auditLog) {
        return AuditLogDTO.builder()
                .id(auditLog.getId())
                .action(auditLog.getAction())
                .entityType(auditLog.getEntityType())
                .entityId(auditLog.getEntityId())
                .oldValue(auditLog.getOldValue())
                .newValue(auditLog.getNewValue())
                .changedFields(auditLog.getChangedFields())
                .performedById(auditLog.getPerformedBy().getId())
                .performedByName(auditLog.getPerformedBy().getUsername())
                .performedAt(auditLog.getPerformedAt())
                .ipAddress(auditLog.getIpAddress())
                .build();
    }
}
