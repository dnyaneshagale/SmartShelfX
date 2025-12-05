package com.infosys.smartshelfx.dtos;

import com.infosys.smartshelfx.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleUpdateRequest {
    private Role role;
}
