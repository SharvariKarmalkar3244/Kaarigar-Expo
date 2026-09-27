package com.kaarigarexpo.event_service.controller;

import com.kaarigarexpo.event_service.dto.EventApplicationRequest;
import com.kaarigarexpo.event_service.entity.ApplicationStatus;
import com.kaarigarexpo.event_service.entity.EventApplication;
import com.kaarigarexpo.event_service.service.EventApplicationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-applications")
public class EventApplicationController {

    private final EventApplicationService service;

    public EventApplicationController(
            EventApplicationService service
    ) {
        this.service = service;
    }

    // Kaarigar applies for an event
    @PostMapping
    public ResponseEntity<EventApplication> applyForEvent(
            @Valid @RequestBody EventApplicationRequest request
    ) {

        EventApplication application =
                service.applyForEvent(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(application);
    }

    // Get all applications of a Kaarigar
    @GetMapping("/kaarigar/{kaarigarId}")
    public ResponseEntity<List<EventApplication>>
    getKaarigarApplications(
            @PathVariable Long kaarigarId
    ) {

        return ResponseEntity.ok(
                service.getApplicationsByKaarigar(kaarigarId)
        );
    }

    // Get all applications for an event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<EventApplication>>
    getEventApplications(
            @PathVariable Long eventId
    ) {

        return ResponseEntity.ok(
                service.getApplicationsByEvent(eventId)
        );
    }

    // Get one application
    @GetMapping("/{id}")
    public ResponseEntity<EventApplication>
    getApplication(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                service.getApplication(id)
        );
    }

    // Admin approves/rejects application
    @PutMapping("/{id}/status")
    public ResponseEntity<EventApplication>
    updateStatus(
            @PathVariable Long id,
            @RequestParam ApplicationStatus status,
            @RequestParam(required = false) String remarks
    ) {

        return ResponseEntity.ok(
                service.updateStatus(
                        id,
                        status,
                        remarks
                )
        );
    }
}