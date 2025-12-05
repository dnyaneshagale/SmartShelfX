package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.NotificationPriority;
import com.infosys.smartshelfx.entity.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private NotificationType type;
    private String title;
    private String message;
    private NotificationPriority priority;
    private Boolean isRead;
    private Boolean isDismissed;
    private String entityType;
    private Long entityId;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private LocalDateTime expiresAt;
}
