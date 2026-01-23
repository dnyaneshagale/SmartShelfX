package com.smartshelfx.service;

import com.smartshelfx.model.ManagerApprovalRequest;
import com.smartshelfx.model.ManagerApprovalRequest.ApprovalStatus;
import com.smartshelfx.model.User;
import com.smartshelfx.model.Role;
import com.smartshelfx.repository.ManagerApprovalRequestRepository;
import com.smartshelfx.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ManagerApprovalService {
    
    @Autowired
    private ManagerApprovalRequestRepository approvalRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public ManagerApprovalRequest createApprovalRequest(User user) {
        ManagerApprovalRequest request = new ManagerApprovalRequest(user);
        return approvalRepository.save(request);
    }
    
    public List<ManagerApprovalRequest> getPendingRequests() {
        return approvalRepository.findByStatus(ApprovalStatus.PENDING);
    }
    
    public List<ManagerApprovalRequest> getAllRequests() {
        return approvalRepository.findAll();
    }
    
    @Transactional
    public ManagerApprovalRequest approveRequest(Long requestId, User admin, String remarks) {
        ManagerApprovalRequest request = approvalRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));
        
        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }
        
        // Update user role to MANAGER
        User user = request.getUser();
        user.setRole(Role.MANAGER);
        userRepository.save(user);
        
        // Update approval request
        request.setStatus(ApprovalStatus.APPROVED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        request.setRemarks(remarks);
        
        return approvalRepository.save(request);
    }
    
    @Transactional
    public ManagerApprovalRequest rejectRequest(Long requestId, User admin, String remarks) {
        ManagerApprovalRequest request = approvalRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Approval request not found"));
        
        if (request.getStatus() != ApprovalStatus.PENDING) {
            throw new RuntimeException("Request already processed");
        }
        
        request.setStatus(ApprovalStatus.REJECTED);
        request.setReviewedBy(admin);
        request.setReviewedAt(LocalDateTime.now());
        request.setRemarks(remarks);
        
        return approvalRepository.save(request);
    }
    
    public boolean hasPendingRequest(User user) {
        return approvalRepository.existsByUserAndStatus(user, ApprovalStatus.PENDING);
    }
}
