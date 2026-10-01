package com.kaarigarexpo.event_service.dto;

import com.kaarigarexpo.event_service.entity.EventStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventResponse(

        Long id,
        String title,
        String description,
        LocalDate startDate,
        LocalDate endDate,
        String location,
        String city,
        String craftType,
        String imageUrl,
        Integer capacity,
        Integer registeredCount,
        Integer availableSlots,
        EventStatus status,
        LocalDateTime createdAt
) {
}
