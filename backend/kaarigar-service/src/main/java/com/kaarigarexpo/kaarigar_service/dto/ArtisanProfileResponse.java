package com.kaarigarexpo.kaarigar_service.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ArtisanProfileResponse(

        Long id,
        Long userId,
        String name,
        String craft,
        String description,
        String photoUrl,
        String phone,
        String location,
        String email,
        LocalDateTime createdAt,
        List<String> workImageUrls
) {
}
