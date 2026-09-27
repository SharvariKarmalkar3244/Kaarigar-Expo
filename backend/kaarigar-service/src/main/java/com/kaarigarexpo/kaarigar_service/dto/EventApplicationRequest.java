package com.kaarigarexpo.kaarigar_service.dto;

import jakarta.validation.constraints.NotNull;

public record EventApplicationRequest(

        @NotNull(message = "Event ID is required")
        Long eventId,

        String message
) {
}