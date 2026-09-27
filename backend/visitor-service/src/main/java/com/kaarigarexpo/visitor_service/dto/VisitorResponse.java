package com.kaarigarexpo.visitor_service.dto;

import java.time.LocalDateTime;

public record VisitorResponse(

        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        LocalDateTime createdAt,
        String photoUrl
) {
}
