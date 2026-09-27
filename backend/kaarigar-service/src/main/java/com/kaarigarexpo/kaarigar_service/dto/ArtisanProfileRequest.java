package com.kaarigarexpo.kaarigar_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

public record ArtisanProfileRequest(

        @NotBlank(message = "Name is required")
        String name,

        @NotBlank(message = "Craft is required")
        String craft,

        @NotBlank(message = "Description is required")
        String description,

        String photoUrl,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must contain exactly 10 digits")
        String phone,

        @NotBlank(message = "Location is required")
        String location,

        String email,

        List<String> workImageUrls
) {
}
