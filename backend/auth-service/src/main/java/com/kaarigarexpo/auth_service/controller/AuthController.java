package com.kaarigarexpo.auth_service.controller;

import com.kaarigarexpo.auth_service.dto.LoginRequest;
import com.kaarigarexpo.auth_service.dto.LoginResponse;
import com.kaarigarexpo.auth_service.dto.RegisterRequest;
import com.kaarigarexpo.auth_service.dto.RegisterResponse;
import com.kaarigarexpo.auth_service.dto.ActionTokenRequest;
import com.kaarigarexpo.auth_service.dto.PasswordResetRequest;
import com.kaarigarexpo.auth_service.entity.Role;
import com.kaarigarexpo.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import io.jsonwebtoken.Claims;
import java.util.Map;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

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

    @GetMapping("/oauth2/google/start")
    public void startGoogleRegistration(
            @RequestParam(required = false) String role,
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        String normalizedRole = role == null || role.isBlank() ? "VISITOR" : role.trim().toUpperCase();
        if (!normalizedRole.equals("VISITOR") && !normalizedRole.equals("KAARIGAR")) {
            response.sendError(HttpStatus.FORBIDDEN.value(), "Public Google registration is limited to visitors and kaarigars");
            return;
        }
        Role requestedRole = Role.valueOf(normalizedRole);

        request.getSession(true).setAttribute("google-registration-role", requestedRole.name());
        response.sendRedirect("/oauth2/authorization/google");
    }

    @PostMapping("/verify-email")
    public Map<String, String> verifyEmail(@Valid @RequestBody ActionTokenRequest request) {
        authService.verifyEmail(request.token());
        return Map.of("message", "Email verified successfully");
    }

    @PostMapping("/verification/resend")
    public Map<String, String> resendVerification(org.springframework.security.core.Authentication authentication) {
        authService.resendVerification(authentication.getName());
        return Map.of("message", "If verification is needed, a new email link has been sent.");
    }

    @PostMapping("/password-reset/request")
    public Map<String, String> requestPasswordReset(@RequestBody Map<String, String> request) {
        authService.requestPasswordReset(request.getOrDefault("email", ""));
        return Map.of("message", "If an account exists for that email, a reset link has been sent.");
    }

    @PostMapping("/password-reset/confirm")
    public Map<String, String> resetPassword(@Valid @RequestBody PasswordResetRequest request) {
        authService.resetPassword(request.token(), request.password());
        return Map.of("message", "Password reset successfully");
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
                "role", claims.get("role"),
                "emailVerified", Boolean.TRUE.equals(claims.get("emailVerified", Boolean.class))
        );
    }
}
