package com.kaarigarexpo.kaarigar_service.controller;

import com.kaarigarexpo.kaarigar_service.dto.EventApplicationRequest;
import com.kaarigarexpo.kaarigar_service.dto.EventApplicationResponse;
import com.kaarigarexpo.kaarigar_service.service.ApplicationService;
import com.kaarigarexpo.kaarigar_service.util.RoleHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/kaarigars/applications")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService = applicationService;
    }

    @PostMapping
    public EventApplicationResponse apply(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @Valid @RequestBody EventApplicationRequest request
    ) {

        if (!RoleHeaders.hasRole(role, "KAARIGAR")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only kaarigars can apply for events"
            );
        }

        return applicationService.apply(
                userId,
                request
        );
    }

    @GetMapping("/my")
    public List<EventApplicationResponse> getMyApplications(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {

        if (!RoleHeaders.hasRole(role, "KAARIGAR")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only kaarigars can view their applications"
            );
        }

        return applicationService.getMyApplications(userId);
    }

    @GetMapping("/event/{eventId}")
    public List<EventApplicationResponse> getApplicationsByEvent(
            @PathVariable Long eventId
    ) {
        return applicationService.getApplicationsByEvent(eventId);
    }
}
