package com.smartshelfx.controller;

import com.smartshelfx.model.ManagerApprovalRequest;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.service.ManagerApprovalService;
import com.smartshelfx.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private ManagerApprovalService approvalService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @GetMapping("/approval-requests")
    public ResponseEntity<List<Map<String, Object>>> getPendingRequests() {
        List<ManagerApprovalRequest> requests = approvalService.getPendingRequests();
        
        // Transform to DTO-like structure
        List<Map<String, Object>> response = requests.stream().map(request -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", request.getId());
            data.put("userId", request.getUser().getId());
            data.put("username", request.getUser().getUsername());
            data.put("email", request.getUser().getEmail());
            data.put("fullName", request.getUser().getFullName());
            data.put("requestedAt", request.getRequestedAt().toString());
            data.put("status", request.getStatus().toString());
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/approval-requests/all")
    public ResponseEntity<List<Map<String, Object>>> getAllRequests() {
        List<ManagerApprovalRequest> requests = approvalService.getAllRequests();
        
        // Transform to DTO-like structure
        List<Map<String, Object>> response = requests.stream().map(request -> {
            Map<String, Object> data = new HashMap<>();
            data.put("id", request.getId());
            data.put("userId", request.getUser().getId());
            data.put("username", request.getUser().getUsername());
            data.put("email", request.getUser().getEmail());
            data.put("fullName", request.getUser().getFullName());
            data.put("requestedAt", request.getRequestedAt().toString());
            data.put("status", request.getStatus().toString());
            if (request.getReviewedBy() != null) {
                data.put("reviewedBy", request.getReviewedBy().getUsername());
                data.put("reviewedAt", request.getReviewedAt().toString());
            }
            if (request.getRemarks() != null) {
                data.put("remarks", request.getRemarks());
            }
            return data;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/approval-requests/{id}/approve")
    public ResponseEntity<Map<String, String>> approveRequest(
            @PathVariable Long id, 
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            System.out.println("=== Approve Request Received ===");
            System.out.println("Request ID: " + id);
            System.out.println("Auth Header: " + (authHeader != null ? "Present" : "Missing"));
            System.out.println("Body: " + body);
            
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("ERROR: Authorization token missing or invalid");
                throw new RuntimeException("Authorization token required");
            }
            
            String token = authHeader.substring(7);
            System.out.println("Token extracted: " + token.substring(0, Math.min(20, token.length())) + "...");
            
            String adminEmail = jwtUtil.extractUsername(token);
            System.out.println("Admin email: " + adminEmail);
            
            User admin = userRepository.findByEmail(adminEmail)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            String remarks = (body != null) ? body.getOrDefault("remarks", "Approved") : "Approved";
            
            approvalService.approveRequest(id, admin, remarks);
            
            System.out.println("SUCCESS: Request approved");
            Map<String, String> response = new HashMap<>();
            response.put("message", "Manager request approved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("ERROR in approve: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
    
    @PostMapping("/approval-requests/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectRequest(
            @PathVariable Long id, 
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Authorization token required");
            }
            
            String token = authHeader.substring(7);
            String adminEmail = jwtUtil.extractUsername(token);
            User admin = userRepository.findByEmail(adminEmail)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            
            String remarks = (body != null) ? body.getOrDefault("remarks", "Rejected") : "Rejected";
            
            approvalService.rejectRequest(id, admin, remarks);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Manager request rejected");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
