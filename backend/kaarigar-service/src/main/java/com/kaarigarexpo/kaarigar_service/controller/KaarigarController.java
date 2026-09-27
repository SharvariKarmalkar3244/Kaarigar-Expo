package com.kaarigarexpo.kaarigar_service.controller;

import com.kaarigarexpo.kaarigar_service.dto.ArtisanProfileRequest;
import com.kaarigarexpo.kaarigar_service.dto.ArtisanProfileResponse;
import com.kaarigarexpo.kaarigar_service.dto.PublicArtisanProfileResponse;
import com.kaarigarexpo.kaarigar_service.service.KaarigarService;
import com.kaarigarexpo.kaarigar_service.util.RoleHeaders;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/kaarigars")
public class KaarigarController {

    private final KaarigarService kaarigarService;

    public KaarigarController(
            KaarigarService kaarigarService
    ) {
        this.kaarigarService = kaarigarService;
    }

    @GetMapping("/health")
    public String health() {
        return "Kaarigar Service is running";
    }

    @PostMapping("/profile")
    public ArtisanProfileResponse createProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody ArtisanProfileRequest request
    ) {

        if (!RoleHeaders.hasRole(role, "KAARIGAR")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only kaarigars can create artisan profiles"
            );
        }

        return kaarigarService.createProfile(
                userId,
                email,
                request
        );
    }

    @GetMapping("/profile")
    public ArtisanProfileResponse getProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role
    ) {

        if (!RoleHeaders.hasRole(role, "KAARIGAR")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only kaarigars can view their artisan profile"
            );
        }

        return kaarigarService.getProfile(userId);
    }

    @PutMapping("/profile")
    public ArtisanProfileResponse updateProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-User-Role") String role,
            @RequestHeader("X-User-Email") String email,
            @Valid @RequestBody ArtisanProfileRequest request
    ) {

        if (!RoleHeaders.hasRole(role, "KAARIGAR")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only kaarigars can update artisan profile"
            );
        }

        return kaarigarService.updateProfile(
                userId,
                email,
                request
        );
    }

    @GetMapping
    public List<ArtisanProfileResponse> getAllProfiles(
            @RequestHeader("X-User-Role") String role
    ) {

        if (!RoleHeaders.hasRole(role, "ADMIN")) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only admins can view all artisan profiles"
            );
        }

        return kaarigarService.getAllProfiles();
    }

    @GetMapping("/{id}")
    public PublicArtisanProfileResponse getProfileById(
            @PathVariable Long id
    ) {
        return kaarigarService.getPublicProfileById(id);
    }

    @GetMapping("/by-user/{userId}")
    public PublicArtisanProfileResponse getProfileByUserId(@PathVariable Long userId) {
        return kaarigarService.getProfileByUserId(userId);
    }
}
