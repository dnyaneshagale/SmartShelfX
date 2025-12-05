package com.infosys.smartshelfx.controller;

import com.infosys.smartshelfx.dtos.LoginRequest;
import com.infosys.smartshelfx.dtos.RegisterRequest;
import com.infosys.smartshelfx.entity.Role;
import com.infosys.smartshelfx.entity.User;
import com.infosys.smartshelfx.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private UserService userService;

    /**
     * Login endpoint for all users (Admin, Warehouse Manager, Vendor)
     * Returns JWT token with user details including role
     */
    @PostMapping("/public/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.authenticateUser(loginRequest));
    }

    /**
     * Register endpoint for new users
     * Supports roles: ADMIN, WAREHOUSEMANAGER, VENDOR
     */
    @PostMapping("/public/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(registerRequest.getPassword());
        user.setEmail(registerRequest.getEmail());
        user.setRole(registerRequest.getRoles());
        userService.registerUser(user);

        return ResponseEntity.ok(Map.of(
                "message", "User registered successfully",
                "username", registerRequest.getUsername(),
                "role", registerRequest.getRoles().toString()));
    }

    /**
     * Get available roles for registration
     */
    @GetMapping("/public/roles")
    public ResponseEntity<?> getAvailableRoles() {
        return ResponseEntity.ok(Map.of(
                "roles", Arrays.stream(Role.values())
                        .map(Enum::name)
                        .collect(Collectors.toList())));
    }
}
