package com.kaarigarexpo.kaarigar_service.service;

import com.kaarigarexpo.kaarigar_service.dto.ArtisanProfileRequest;
import com.kaarigarexpo.kaarigar_service.dto.ArtisanProfileResponse;
import com.kaarigarexpo.kaarigar_service.dto.PublicArtisanProfileResponse;
import com.kaarigarexpo.kaarigar_service.entity.ArtisanProfile;
import com.kaarigarexpo.kaarigar_service.repository.ArtisanProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class KaarigarService {

    private final ArtisanProfileRepository profileRepository;

    public KaarigarService(
            ArtisanProfileRepository profileRepository
    ) {
        this.profileRepository = profileRepository;
    }

    public ArtisanProfileResponse createProfile(
            Long userId,
            String email,
            ArtisanProfileRequest request
    ) {

        if (profileRepository.existsByUserId(userId)) {
            throw new RuntimeException(
                    "Kaarigar profile already exists"
            );
        }

        ArtisanProfile profile = new ArtisanProfile();

        profile.setUserId(userId);
        profile.setName(request.name());
        profile.setCraft(request.craft());
        profile.setDescription(request.description());
        profile.setPhotoUrl(request.photoUrl());
        profile.setWorkImageUrls(request.workImageUrls());
        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setEmail(email);

        return mapToResponse(
                profileRepository.save(profile)
        );
    }

    public ArtisanProfileResponse getProfile(Long userId) {

        ArtisanProfile profile =
                profileRepository.findByUserId(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kaarigar profile not found"));

        return mapToResponse(profile);
    }

    public ArtisanProfileResponse updateProfile(
            Long userId,
            String email,
            ArtisanProfileRequest request
    ) {

        ArtisanProfile profile =
                profileRepository.findByUserId(userId)
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kaarigar profile not found"));

        profile.setName(request.name());
        profile.setCraft(request.craft());
        profile.setDescription(request.description());
        profile.setPhotoUrl(request.photoUrl());
        profile.setWorkImageUrls(request.workImageUrls());
        profile.setPhone(request.phone());
        profile.setLocation(request.location());
        profile.setEmail(email);

        return mapToResponse(
                profileRepository.save(profile)
        );
    }

    public java.util.List<ArtisanProfileResponse>
    getAllProfiles() {

        return profileRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Page<ArtisanProfileResponse> getAllProfiles(Pageable pageable) {
        return profileRepository.findAll(pageable).map(this::mapToResponse);
    }

    public ArtisanProfileResponse getProfileById(Long id) {

        ArtisanProfile profile =
                profileRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Kaarigar profile not found with id: " + id
                                )
                        );

        return mapToResponse(profile);
    }

    public PublicArtisanProfileResponse getPublicProfileById(Long id) {
        ArtisanProfile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kaarigar profile not found"));
        return mapToPublicResponse(profile);
    }

    private ArtisanProfileResponse mapToResponse(
            ArtisanProfile profile
    ) {

        return new ArtisanProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getName(),
                profile.getCraft(),
                profile.getDescription(),
                profile.getPhotoUrl(),
                profile.getPhone(),
                profile.getLocation(),
                profile.getEmail(),
                profile.getCreatedAt(),
                profile.getWorkImageUrls()
        );
    }

    public PublicArtisanProfileResponse getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(this::mapToPublicResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kaarigar profile not found"));
    }

    private PublicArtisanProfileResponse mapToPublicResponse(ArtisanProfile profile) {
        return new PublicArtisanProfileResponse(profile.getUserId(), profile.getName(), profile.getCraft(),
                profile.getLocation(), profile.getPhotoUrl(), List.copyOf(profile.getWorkImageUrls()), profile.getDescription());
    }
}
