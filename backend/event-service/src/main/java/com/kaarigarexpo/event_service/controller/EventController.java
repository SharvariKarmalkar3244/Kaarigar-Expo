package com.kaarigarexpo.event_service.controller;

import com.kaarigarexpo.event_service.dto.EventParticipantResponse;
import com.kaarigarexpo.event_service.dto.EventRequest;
import com.kaarigarexpo.event_service.dto.EventResponse;
import com.kaarigarexpo.event_service.dto.EventVisitorResponse;
import com.kaarigarexpo.event_service.dto.EntryTicketResponse;
import com.kaarigarexpo.event_service.dto.TicketVerificationRequest;
import com.kaarigarexpo.event_service.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // =========================
    // HEALTH
    // =========================

    @GetMapping("/health")
    public String health() {
        return "Event Service is running";
    }

    // =========================
    // CREATE EVENT
    // =========================

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody EventRequest request
    ) {
        requireAdmin(role);
        return eventService.createEvent(request);
    }

    // =========================
    // GET ALL EVENTS
    // =========================

    @GetMapping
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    // =========================
    // GET UPCOMING EVENTS
    // =========================

    @GetMapping("/upcoming")
    public List<EventResponse> getUpcomingEvents() {
        return eventService.getUpcomingEvents();
    }

    // =========================
    // GET EVENT BY ID
    // =========================

    @GetMapping("/{id}")
    public EventResponse getEventById(
            @PathVariable Long id
    ) {
        return eventService.getEventById(id);
    }

    // =========================
    // UPDATE EVENT
    // =========================

    @PutMapping("/{id}")
    public EventResponse updateEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody EventRequest request
    ) {
        requireAdmin(role);
        return eventService.updateEvent(id, request);
    }

    // =========================
    // DELETE EVENT
    // =========================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        requireAdmin(role);
        eventService.deleteEvent(id);
    }

    // =========================
    // GET EVENT PARTICIPANTS
    // =========================

    @GetMapping("/{id}/participants")
    public List<EventParticipantResponse> getEventParticipants(
            @PathVariable Long id
    ) {
        return eventService.getEventParticipants(id);
    }

    // =========================
    // GET EVENT REGISTRATIONS
    // =========================

    @GetMapping("/{id}/registrations")
    public List<EventVisitorResponse> getEventRegistrations(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        requireAdmin(role);
        return eventService.getEventRegistrations(id);
    }

    @PostMapping("/tickets/verify")
    public EntryTicketResponse verifyTicket(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @Valid @RequestBody TicketVerificationRequest request
    ) {
        requireAdmin(role);
        return eventService.verifyTicket(request.ticketCode(), request.eventId());
    }

    @GetMapping("/{id}/tickets")
    public List<EntryTicketResponse> getEventTickets(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        requireAdmin(role);
        return eventService.getEventTickets(id);
    }

    private void requireAdmin(String role) {
        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only admins can manage event entry");
        }
    }


}
