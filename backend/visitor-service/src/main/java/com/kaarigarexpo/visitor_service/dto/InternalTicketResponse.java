package com.kaarigarexpo.visitor_service.dto;

import java.time.LocalDateTime;

public record InternalTicketResponse(
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
