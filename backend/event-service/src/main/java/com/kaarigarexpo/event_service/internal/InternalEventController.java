package com.kaarigarexpo.event_service.internal;

import com.kaarigarexpo.event_service.service.EventService;
import com.kaarigarexpo.event_service.service.AuditLogService;
import com.kaarigarexpo.event_service.dto.EntryTicketRequest;
import com.kaarigarexpo.event_service.dto.EntryTicketResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/events")
public class InternalEventController {

    private final EventService eventService;
    private final AuditLogService auditLogService;

    public InternalEventController(EventService eventService, AuditLogService auditLogService) {
        this.eventService = eventService;
        this.auditLogService = auditLogService;
    }

    @PostMapping("/{id}/reserve-slot")
    public String reserveSlot(
            @PathVariable Long id
    ) {

        eventService.reserveSlot(id);

        return "Slot reserved successfully";
    }

    @PostMapping("/{id}/release-slot")
    public String releaseSlot(
            @PathVariable Long id
    ) {

        eventService.releaseSlot(id);

        return "Slot released successfully";
    }

    @PostMapping("/{id}/apply")
    public String applyForEvent(
            @PathVariable Long id,
            @RequestBody ApplicationRequest request
    ) {

        eventService.createApplication(id, request.kaarigarId());

        return "Application created successfully";
    }

    @PostMapping("/{id}/tickets")
    public EntryTicketResponse issueTicket(
            @PathVariable Long id,
            @Valid @RequestBody EntryTicketRequest request
    ) {
        return eventService.issueTicket(id, request);
    }

    @DeleteMapping("/tickets/{ticketCode}")
    public void revokeTicket(@PathVariable String ticketCode) {
        eventService.revokeTicket(ticketCode);
    }

    @PostMapping("/audit")
    public void recordAudit(@RequestBody AuditRequest request) {
        auditLogService.record(request.action(), request.entityType(), request.entityId(),
                request.actorEmail(), request.details());
    }

    record ApplicationRequest(Long kaarigarId) {}
    record AuditRequest(String action, String entityType, Long entityId, String actorEmail, String details) {}
}
