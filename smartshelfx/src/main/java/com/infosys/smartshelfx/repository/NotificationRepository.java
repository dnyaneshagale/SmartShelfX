package com.infosys.smartshelfx.repository;

import com.infosys.smartshelfx.entity.Notification;
import com.infosys.smartshelfx.entity.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);

    Page<Notification> findByUserIdAndIsDismissedFalseOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Notification> findByUserIdAndTypeOrderByCreatedAtDesc(Long userId, NotificationType type);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    Long countUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isDismissed = false " +
            "ORDER BY n.priority DESC, n.createdAt DESC")
    List<Notification> findActiveNotifications(@Param("userId") Long userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    void markAsRead(@Param("id") Long id, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId")
    void markAllAsReadByUserId(@Param("userId") Long userId, @Param("readAt") LocalDateTime readAt);

    @Modifying
    @Query("UPDATE Notification n SET n.isDismissed = true WHERE n.id = :id")
    void dismiss(@Param("id") Long id);

    @Query("SELECT n FROM Notification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now AND n.isDismissed = false")
    List<Notification> findExpiredNotifications(@Param("now") LocalDateTime now);

    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.entityId = :entityId " +
            "AND n.createdAt > :since")
    List<Notification> findRecentByTypeAndEntity(
            @Param("type") NotificationType type,
            @Param("entityId") Long entityId,
            @Param("since") LocalDateTime since);

    @Modifying
    @Query("DELETE FROM Notification n WHERE n.createdAt < :before")
    void deleteByCreatedAtBefore(@Param("before") LocalDateTime before);
}
