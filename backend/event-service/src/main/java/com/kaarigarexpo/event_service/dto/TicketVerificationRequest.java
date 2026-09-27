package com.kaarigarexpo.event_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TicketVerificationRequest(@NotBlank String ticketCode, @NotNull Long eventId) {}
