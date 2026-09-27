package com.kaarigarexpo.kaarigar_service.dto;

import com.kaarigarexpo.kaarigar_service.entity.ApplicationStatus;
import java.time.LocalDateTime;
import java.util.List;

public record EventApplicationResponse(
        Long id,
        Long userId,
        Long eventId,
        String kaarigarName,
        String eventTitle,
        ApplicationStatus status,
        String message,
        String rejectionReason,
        String entryTicketCode,
        LocalDateTime appliedAt,
        LocalDateTime reviewedAt,
        String phone,
        String location,
        String photoUrl,
        List<String> workImageUrls
) {
}
