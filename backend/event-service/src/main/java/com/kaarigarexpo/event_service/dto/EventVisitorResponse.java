package com.kaarigarexpo.event_service.dto;

import java.time.LocalDateTime;

public record EventVisitorResponse(
        Long id,
        Long visitorId,
        String visitorName,
        String email,
        String phone,
        LocalDateTime registeredAt,
        String eventTitle,
        String photoUrl
) {
}
