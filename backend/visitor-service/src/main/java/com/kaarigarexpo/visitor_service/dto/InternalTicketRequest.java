package com.kaarigarexpo.visitor_service.dto;

public record InternalTicketRequest(Long userId, String attendeeType, String attendeeName, String attendeePhone, String attendeeEmail) {}
