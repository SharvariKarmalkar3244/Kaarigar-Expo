package com.kaarigarexpo.event_service.dto;

import java.time.LocalDateTime;

public record EntryTicketResponse(
        Long id,
        String ticketCode,
        Long eventId,
        Long userId,
        String attendeeType,
        String attendeeName,
        String attendeePhone,
        String attendeeEmail,
        boolean checkedIn,
        boolean alreadyCheckedIn,
        LocalDateTime issuedAt,
        LocalDateTime checkedInAt
) {}
