package com.kaarigarexpo.visitor_service.dto;

import java.time.LocalDateTime;

public record EventRegistrationResponse(

        Long id,
        Long userId,
        Long eventId,
        LocalDateTime registeredAt,
        String visitorName,
        String email,
        String phone,
        String eventTitle,
        String eventLocation,
        String ticketCode,
        String photoUrl,
        String eventStartDate,
        String eventEndDate
) {
}
