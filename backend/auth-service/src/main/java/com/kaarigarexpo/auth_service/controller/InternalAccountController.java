package com.kaarigarexpo.auth_service.controller;

import com.kaarigarexpo.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/internal/accounts")
public class InternalAccountController {
    private final AuthService authService;

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    public InternalAccountController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/{userId}/display-name")
    public DisplayNameResponse getDisplayName(
            @PathVariable Long userId,
            @RequestHeader(value = "X-Internal-Secret", required = false) String secret
    ) {
        if (!internalServiceSecret.equals(secret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized internal request");
        }
        return new DisplayNameResponse(authService.getDisplayName(userId));
    }

    public record DisplayNameResponse(String name) {}
}
