package com.kaarigarexpo.kaarigar_service.dto;

import java.util.List;

public record PublicArtisanProfileResponse(
        Long userId,
        String name,
        String craft,
        String location,
        String photoUrl,
        List<String> workImageUrls,
        String description
) {}
