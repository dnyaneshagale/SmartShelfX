package com.smartshelfx.repository;

import com.smartshelfx.model.ManagerApprovalRequest;
import com.smartshelfx.model.ManagerApprovalRequest.ApprovalStatus;
import com.smartshelfx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ManagerApprovalRequestRepository extends JpaRepository<ManagerApprovalRequest, Long> {
    
    List<ManagerApprovalRequest> findByStatus(ApprovalStatus status);
    
    Optional<ManagerApprovalRequest> findByUserAndStatus(User user, ApprovalStatus status);
    
    boolean existsByUserAndStatus(User user, ApprovalStatus status);
}
