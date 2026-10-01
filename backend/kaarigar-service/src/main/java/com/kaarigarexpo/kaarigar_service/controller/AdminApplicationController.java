package com.kaarigarexpo.kaarigar_service.controller;

import com.kaarigarexpo.kaarigar_service.dto.AdminReviewRequest;
import com.kaarigarexpo.kaarigar_service.dto.EventApplicationResponse;
import com.kaarigarexpo.kaarigar_service.service.ApplicationService;
import com.kaarigarexpo.kaarigar_service.util.RoleHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/admin/applications")
public class AdminApplicationController {

    private final ApplicationService applicationService;

    public AdminApplicationController(
            ApplicationService applicationService
    ) {
        this.applicationService =
                applicationService;
    }

    // =========================
    // GET PENDING APPLICATIONS
    // ADMIN ONLY
    // =========================


    @GetMapping("/pending")
    public Page<EventApplicationResponse> getPendingApplications(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {

        System.out.println("ADMIN ROLE HEADER = " + role);

        if (!RoleHeaders.hasRole(role, "ADMIN")) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view pending applications"
            );
        }

        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), 100);
        return applicationService.getPendingApplications(
                PageRequest.of(safePage, safeSize, Sort.by("appliedAt").descending())
        );
    }

    // =========================
    // REVIEW APPLICATION
    // ADMIN ONLY
    // =========================

    @PutMapping("/{id}/review")
    public EventApplicationResponse reviewApplication(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String actorEmail,
            @Valid @RequestBody AdminReviewRequest request
    ) {

        if (!RoleHeaders.hasRole(role, "ADMIN")) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can review applications"
            );
        }

        return applicationService.reviewApplication(
                id,
                request.status(),
                request.rejectionReason(),
                actorEmail
        );
    }
}
