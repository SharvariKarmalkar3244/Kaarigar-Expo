package com.kaarigarexpo.visitor_service.controller;

import com.kaarigarexpo.visitor_service.dto.EventRegistrationRequest;
import com.kaarigarexpo.visitor_service.dto.EventRegistrationResponse;
import com.kaarigarexpo.visitor_service.service.EventRegistrationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visitors/registrations")
public class EventRegistrationController {

    private final EventRegistrationService registrationService;

    public EventRegistrationController(
            EventRegistrationService registrationService
    ) {
        this.registrationService =
                registrationService;
    }

    @PostMapping
    public EventRegistrationResponse register(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody EventRegistrationRequest request
    ) {

        return registrationService.register(
                userId,
                request.eventId()
        );
    }

    @GetMapping("/my")
    public List<EventRegistrationResponse>
    getMyRegistrations(
            @RequestHeader("X-User-Id") Long userId
    ) {

        return registrationService
                .getMyRegistrations(userId);
    }

    @GetMapping("/event/{eventId}")
    public List<EventRegistrationResponse>
    getRegistrationsByEvent(
            @PathVariable Long eventId
    ) {

        return registrationService
                .getRegistrationsByEvent(eventId);
    }
}