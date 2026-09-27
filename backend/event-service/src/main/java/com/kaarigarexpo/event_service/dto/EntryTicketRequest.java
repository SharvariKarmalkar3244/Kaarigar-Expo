package com.kaarigarexpo.event_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EntryTicketRequest(
        @NotNull Long userId,
        @NotBlank String attendeeType,
        String attendeeName,
        String attendeePhone,
        String attendeeEmail
) {}
