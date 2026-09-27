package com.kaarigarexpo.kaarigar_service.controller;

import com.kaarigarexpo.kaarigar_service.dto.AdminReviewRequest;
import com.kaarigarexpo.kaarigar_service.dto.EventApplicationResponse;
import com.kaarigarexpo.kaarigar_service.service.ApplicationService;
import com.kaarigarexpo.kaarigar_service.util.RoleHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

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
    public List<EventApplicationResponse> getPendingApplications(
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {

        System.out.println("ADMIN ROLE HEADER = " + role);

        if (!RoleHeaders.hasRole(role, "ADMIN")) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view pending applications"
            );
        }

        return applicationService.getPendingApplications();
    }

    // =========================
    // REVIEW APPLICATION
    // ADMIN ONLY
    // =========================

    @PutMapping("/{id}/review")
    public EventApplicationResponse reviewApplication(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
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
                request.rejectionReason()
        );
    }
}
