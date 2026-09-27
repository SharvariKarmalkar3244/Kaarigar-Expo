package com.kaarigarexpo.auth_service.dto;

import com.kaarigarexpo.auth_service.entity.Role;

public record RegisterResponse(
        Long id,
        String name,
        String email,
        Role role,
        String message
) {
}