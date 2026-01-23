package com.smartshelfx.service;

import com.smartshelfx.dto.LoginRequest;
import com.smartshelfx.dto.LoginResponse;
import com.smartshelfx.dto.SignupRequest;
import com.smartshelfx.model.Role;
import com.smartshelfx.model.User;
import com.smartshelfx.repository.UserRepository;
import com.smartshelfx.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private ManagerApprovalService managerApprovalService;
    
    public LoginResponse login(LoginRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        
        // Check if user is active
        if (!user.isActive()) {
            throw new RuntimeException("Account is deactivated");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole().name(), user.getFullName());
    }
    
    public LoginResponse signup(SignupRequest request) {
        // Validate role - only MANAGER and VENDOR allowed
        if (request.getRole() != Role.MANAGER && request.getRole() != Role.VENDOR) {
            throw new RuntimeException("Only MANAGER and VENDOR roles are allowed for registration");
        }
        
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        
        // Check if username already exists
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already taken");
        }
        
        // Create new user
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        
        // If registering as MANAGER, assign VENDOR role temporarily and create approval request
        if (request.getRole() == Role.MANAGER) {
            user.setRole(Role.VENDOR); // Temporary role
            userRepository.save(user);
            
            // Create approval request
            managerApprovalService.createApprovalRequest(user);
            
            // Generate token with VENDOR role (temporary)
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole().name(), user.getFullName(), 
                    "Your manager role request is pending admin approval. You are temporarily assigned as VENDOR.");
        } else {
            // For VENDOR, assign role directly
            user.setRole(request.getRole());
            userRepository.save(user);
            
            // Generate token and return response
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
            return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole().name(), user.getFullName());
        }
    }
}
