package com.kaarigarexpo.auth_service.dto;

import jakarta.validation.constraints.NotBlank;
public record ActionTokenRequest(@NotBlank String token) {}
