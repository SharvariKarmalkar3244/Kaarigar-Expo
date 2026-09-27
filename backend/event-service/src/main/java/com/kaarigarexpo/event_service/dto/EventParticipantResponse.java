package com.kaarigarexpo.event_service.dto;

import java.time.LocalDateTime;
import java.util.List;

public record EventParticipantResponse(
        Long id,
        Long kaarigarId,
        String name,
        String craft,
        String location,
        String status,
        LocalDateTime appliedAt,
        String photoUrl,
        List<String> workImageUrls,
        String description
) {
}
