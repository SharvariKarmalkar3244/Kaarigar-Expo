package com.kaarigarexpo.event_service.controller;

import com.kaarigarexpo.event_service.dto.EventParticipantResponse;
import com.kaarigarexpo.event_service.dto.AdminAnalyticsResponse;
import com.kaarigarexpo.event_service.dto.EventRequest;
import com.kaarigarexpo.event_service.dto.EventResponse;
import com.kaarigarexpo.event_service.dto.EventVisitorResponse;
import com.kaarigarexpo.event_service.dto.EntryTicketResponse;
import com.kaarigarexpo.event_service.dto.TicketVerificationRequest;
import com.kaarigarexpo.event_service.entity.EventStatus;
import com.kaarigarexpo.event_service.service.EventService;
import com.kaarigarexpo.event_service.service.AuditLogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final AuditLogService auditLogService;

    public EventController(EventService eventService, AuditLogService auditLogService) {
        this.eventService = eventService;
        this.auditLogService = auditLogService;
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
            @RequestHeader(value = "X-User-Email", required = false) String actor,
            @Valid @RequestBody EventRequest request
    ) {
        requireAdmin(role);
        EventResponse created = eventService.createEvent(request);
        auditLogService.record("EVENT_CREATED", "EVENT", created.id(), actor, created.title());
        return created;
    }

    // =========================
    // GET ALL EVENTS
    // =========================

    @GetMapping
    public Page<EventResponse> getAllEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String city,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) String craftType,
            @RequestParam(defaultValue = "false") boolean availableOnly
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(size, 1), 50);
        EventStatus eventStatus = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status)
                ? null : EventStatus.valueOf(status.trim().toUpperCase());
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date filter must be before end date filter");
        }
        return eventService.getEvents(eventStatus, city, query, fromDate, toDate, craftType, availableOnly,
                PageRequest.of(safePage, safeSize, Sort.by("startDate").ascending()));
    }

    @GetMapping("/admin/analytics")
    public AdminAnalyticsResponse getAdminAnalytics(
            @RequestHeader(value = "X-User-Role", required = false) String role
    ) {
        requireAdmin(role);
        return eventService.getAdminAnalytics();
    }

    @GetMapping("/admin/audit")
    public Page<com.kaarigarexpo.event_service.entity.AuditLog> getAuditLog(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        requireAdmin(role);
        return auditLogService.recent(page, size);
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
            @RequestHeader(value = "X-User-Email", required = false) String actor,
            @Valid @RequestBody EventRequest request
    ) {
        requireAdmin(role);
        EventResponse updated = eventService.updateEvent(id, request);
        auditLogService.record("EVENT_UPDATED", "EVENT", id, actor, updated.title());
        return updated;
    }

    // =========================
    // DELETE EVENT
    // =========================

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-User-Email", required = false) String actor
    ) {
        requireAdmin(role);
        eventService.deleteEvent(id);
        auditLogService.record("EVENT_DELETED", "EVENT", id, actor, null);
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
            @RequestHeader(value = "X-User-Email", required = false) String actor,
            @Valid @RequestBody TicketVerificationRequest request
    ) {
        requireAdmin(role);
        EntryTicketResponse verified = eventService.verifyTicket(request.ticketCode(), request.eventId());
        auditLogService.record(verified.alreadyCheckedIn() ? "DUPLICATE_SCAN" : "TICKET_CHECKED_IN",
                "ENTRY_TICKET", verified.id(), actor, "eventId=" + request.eventId() + "; ticketCode=" + request.ticketCode());
        return verified;
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
