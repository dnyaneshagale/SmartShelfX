package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private Role roles;
    private String password;
}