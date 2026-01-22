package com.smartshelfx.controller;

import com.smartshelfx.dto.LoginRequest;
import com.smartshelfx.dto.LoginResponse;
import com.smartshelfx.dto.SignupRequest;
import com.smartshelfx.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/signup")
    public ResponseEntity<LoginResponse> signup(@RequestBody SignupRequest request) {
        LoginResponse response = authService.signup(request);
        return ResponseEntity.ok(response);
    }
}
