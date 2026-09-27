package com.kaarigarexpo.visitor_service.dto;

import jakarta.validation.constraints.NotNull;

public record EventRegistrationRequest(

        @NotNull(message = "Event ID is required")
        Long eventId
) {
}