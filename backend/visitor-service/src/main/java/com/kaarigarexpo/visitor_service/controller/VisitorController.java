package com.kaarigarexpo.visitor_service.controller;

import com.kaarigarexpo.visitor_service.dto.VisitorRequest;
import com.kaarigarexpo.visitor_service.dto.VisitorResponse;
import com.kaarigarexpo.visitor_service.service.VisitorProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/visitors")
public class VisitorController {

    private final VisitorProfileService visitorProfileService;

    public VisitorController(
            VisitorProfileService visitorProfileService
    ) {
        this.visitorProfileService =
                visitorProfileService;
    }

    @GetMapping("/health")
    public String health() {
        return "Visitor Service is running";
    }

    @PostMapping("/profile")
    public VisitorResponse createProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody VisitorRequest request
    ) {

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User ID is required"
            );
        }

        return visitorProfileService.createProfile(
                userId,
                request
        );
    }

    @GetMapping("/profile")
    public VisitorResponse getProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long userId
    ) {

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "User ID is required"
            );
        }

        try {
            return visitorProfileService.getProfile(userId);
        } catch (RuntimeException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Visitor profile not found"
            );
        }
    }

    @PutMapping("/profile")
    public VisitorResponse updateProfile(
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @Valid @RequestBody VisitorRequest request
    ) {
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User ID is required");
        }
        return visitorProfileService.updateProfile(userId, request);
    }
}
