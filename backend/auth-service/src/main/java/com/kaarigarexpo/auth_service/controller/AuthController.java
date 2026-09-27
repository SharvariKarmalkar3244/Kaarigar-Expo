package com.kaarigarexpo.auth_service.controller;

import com.kaarigarexpo.auth_service.dto.LoginRequest;
import com.kaarigarexpo.auth_service.dto.LoginResponse;
import com.kaarigarexpo.auth_service.dto.RegisterRequest;
import com.kaarigarexpo.auth_service.dto.RegisterResponse;
import com.kaarigarexpo.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Claims;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/health")
    public String health() {
        return "Auth Service is running";
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return authService.login(request);
    }
    @GetMapping("/me")
    public Map<String, Object> me(
            org.springframework.security.core.Authentication authentication
    ) {
        Claims claims = (Claims) authentication.getDetails();
        return Map.of(
                "userId", claims.get("userId"),
                "name", claims.get("name"),
                "email", authentication.getName(),
                "role", claims.get("role")
        );
    }
}
