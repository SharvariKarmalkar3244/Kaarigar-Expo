package com.kaarigarexpo.auth_service.dto;

public record LoginResponse(
        String token,
        Long userId,
        String name,
        String email,
        String role,
        boolean emailVerified
) {
}
