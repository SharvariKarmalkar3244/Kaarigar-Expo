package com.kaarigarexpo.visitor_service.service;

import com.kaarigarexpo.visitor_service.dto.EventRegistrationResponse;
import com.kaarigarexpo.visitor_service.dto.VisitorResponse;
import com.kaarigarexpo.visitor_service.dto.InternalTicketRequest;
import com.kaarigarexpo.visitor_service.dto.InternalTicketResponse;
import com.kaarigarexpo.visitor_service.entity.EventRegistration;
import com.kaarigarexpo.visitor_service.repository.EventRegistrationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
public class EventRegistrationService {

    private final EventRegistrationRepository registrationRepository;
    private final RestTemplate restTemplate;

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Value("${services.event-url:http://localhost:8082}")
    private String eventServiceUrl;

    @Value("${services.visitor-url:http://localhost:8084}")
    private String visitorServiceUrl;

    public EventRegistrationService(
            EventRegistrationRepository registrationRepository,
            RestTemplate restTemplate
    ) {
        this.registrationRepository = registrationRepository;
        this.restTemplate = restTemplate;
    }

    // =========================
    // REGISTER FOR EVENT
    // =========================

    @Transactional
    public EventRegistrationResponse register(
            Long userId,
            Long eventId
    ) {

        // STEP 1: Prevent duplicate registration
        if (registrationRepository.existsByUserIdAndEventId(userId, eventId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You are already registered for this event"
            );
        }

        // STEP 2: Get event details BEFORE reserving a slot
        Map<String, Object> eventDetails = getEventDetails(eventId);

        if (eventDetails == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Event not found"
            );
        }

        // STEP 3: Check event status
        String status =
                eventDetails.get("status") != null
                        ? eventDetails.get("status")
                        .toString()
                        .toUpperCase()
                        : "UPCOMING";

        if (!"UPCOMING".equals(status)) {

            if ("COMPLETED".equals(status)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Registration is closed because this event has already completed"
                );
            }

            if ("ONGOING".equals(status)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Registration is closed because this event is currently ongoing"
                );
            }

            if ("CANCELLED".equals(status)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Registration is unavailable because this event has been cancelled"
                );
            }

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Registration is not available for this event"
            );
        }

        VisitorResponse visitor = getVisitorDetails(userId);
        if (visitor == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Complete your visitor profile before registering for an event"
            );
        }

        // STEP 4: Reserve event slot
        reserveEventSlot(eventId);

        String issuedTicketCode = null;
        try {

            // STEP 5: Save visitor registration
            // STEP 6: Get visitor details
            InternalTicketResponse ticket = issueTicket(eventId, userId, visitor);
            issuedTicketCode = ticket.ticketCode();

            EventRegistration registration = new EventRegistration();
            registration.setUserId(userId);
            registration.setEventId(eventId);
            registration.setTicketCode(ticket.ticketCode());
            EventRegistration saved = registrationRepository.save(registration);

            // STEP 7: Return registration response
            return new EventRegistrationResponse(
                    saved.getId(),
                    saved.getUserId(),
                    saved.getEventId(),
                    saved.getRegisteredAt(),

                    visitor != null
                            ? visitor.name()
                            : null,

                    visitor != null
                            ? visitor.email()
                            : null,

                    visitor != null
                            ? visitor.phone()
                            : null,

                    eventDetails.get("title") != null
                            ? eventDetails.get("title").toString()
                            : null,

                    eventDetails.get("location") != null
                            ? eventDetails.get("location").toString()
                            : null,
                    saved.getTicketCode(),
                    visitor != null ? visitor.photoUrl() : null,
                    eventDetails.get("startDate") != null ? eventDetails.get("startDate").toString() : null,
                    eventDetails.get("endDate") != null ? eventDetails.get("endDate").toString() : null
            );

        } catch (RuntimeException exception) {

            // STEP 8: Release reserved slot
            // if local registration fails
            try {
                releaseEventSlot(eventId);
        } catch (Exception ignored) {
            // Log in production
        }

        if (issuedTicketCode != null) {
            try {
                revokeEventTicket(issuedTicketCode);
            } catch (Exception ignored) {
                // Preserve the registration failure.
            }
        }

            throw exception;
        }
    }


    // =========================
    // GET MY REGISTRATIONS
    // =========================

    public List<EventRegistrationResponse> getMyRegistrations(
            Long userId
    ) {

        VisitorResponse visitor =
                getVisitorDetails(userId);

        return registrationRepository
                .findByUserIdOrderByRegisteredAtDesc(userId)
                .stream()
                .map(registration -> {

                    Map<String, Object> eventDetails =
                            getEventDetails(
                                    registration.getEventId()
                            );

                    return new EventRegistrationResponse(
                            registration.getId(),
                            registration.getUserId(),
                            registration.getEventId(),
                            registration.getRegisteredAt(),

                            visitor != null
                                    ? visitor.name()
                                    : null,

                            visitor != null
                                    ? visitor.email()
                                    : null,

                            visitor != null
                                    ? visitor.phone()
                                    : null,

                            eventDetails != null
                                    && eventDetails.get("title") != null
                                    ? eventDetails.get("title").toString()
                                    : null,

                            eventDetails != null
                                    && eventDetails.get("location") != null
                                    ? eventDetails.get("location").toString()
                                    : null,
                            registration.getTicketCode(),
                            visitor != null ? visitor.photoUrl() : null,
                            eventDetails != null && eventDetails.get("startDate") != null
                                    ? eventDetails.get("startDate").toString() : null,
                            eventDetails != null && eventDetails.get("endDate") != null
                                    ? eventDetails.get("endDate").toString() : null
                    );
                })
                .toList();
    }


    // =========================
    // GET REGISTRATIONS BY EVENT
    // =========================

    public List<EventRegistrationResponse> getRegistrationsByEvent(
            Long eventId
    ) {

        Map<String, Object> eventDetails =
                getEventDetails(eventId);

        return registrationRepository
                .findByEventIdOrderByRegisteredAtAsc(eventId)
                .stream()
                .map(registration -> {

                    VisitorResponse visitor =
                            getVisitorDetails(
                                    registration.getUserId()
                            );

                    return new EventRegistrationResponse(
                            registration.getId(),
                            registration.getUserId(),
                            registration.getEventId(),
                            registration.getRegisteredAt(),

                            visitor != null
                                    ? visitor.name()
                                    : null,

                            visitor != null
                                    ? visitor.email()
                                    : null,

                            visitor != null
                                    ? visitor.phone()
                                    : null,

                            eventDetails != null
                                    && eventDetails.get("title") != null
                                    ? eventDetails.get("title").toString()
                                    : null,

                            eventDetails != null
                                    && eventDetails.get("location") != null
                                    ? eventDetails.get("location").toString()
                                    : null,
                            registration.getTicketCode(),
                            visitor != null ? visitor.photoUrl() : null,
                            eventDetails != null && eventDetails.get("startDate") != null
                                    ? eventDetails.get("startDate").toString() : null,
                            eventDetails != null && eventDetails.get("endDate") != null
                                    ? eventDetails.get("endDate").toString() : null
                    );
                })
                .toList();
    }


    // =========================
    // RESERVE EVENT SLOT
    // =========================

    private void reserveEventSlot(Long eventId) {

        String url =
                serviceUrl(eventServiceUrl, "/internal/events/")
                        + eventId
                        + "/reserve-slot";

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-Internal-Secret",
                internalServiceSecret
        );

        HttpEntity<Void> requestEntity =
                new HttpEntity<>(
                        null,
                        headers
                );

        restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Void.class
        );
    }


    // =========================
    // RELEASE EVENT SLOT
    // =========================

    private void releaseEventSlot(Long eventId) {

        String url =
                serviceUrl(eventServiceUrl, "/internal/events/")
                        + eventId
                        + "/release-slot";

        HttpHeaders headers =
                new HttpHeaders();

        headers.set(
                "X-Internal-Secret",
                internalServiceSecret
        );

        HttpEntity<Void> requestEntity =
                new HttpEntity<>(
                        null,
                        headers
                );

        restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                Void.class
        );
    }

    private InternalTicketResponse issueTicket(Long eventId, Long userId, VisitorResponse visitor) {
        String url = serviceUrl(eventServiceUrl, "/internal/events/" + eventId + "/tickets");
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalServiceSecret);
        InternalTicketRequest body = new InternalTicketRequest(
                userId,
                "VISITOR",
                visitor != null ? visitor.name() : null,
                visitor != null ? visitor.phone() : null,
                visitor != null ? visitor.email() : null
        );
        InternalTicketResponse ticket = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), InternalTicketResponse.class
        ).getBody();
        if (ticket == null) {
            throw new IllegalStateException("Unable to issue an event entry ticket");
        }
        return ticket;
    }

    private void revokeEventTicket(String ticketCode) {
        String url = serviceUrl(eventServiceUrl, "/internal/events/tickets/" + ticketCode);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalServiceSecret);
        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
    }


    // =========================
    // GET VISITOR DETAILS
    // =========================

    private VisitorResponse getVisitorDetails(Long userId) {

        try {

            String url =
                    serviceUrl(visitorServiceUrl, "/api/visitors/profile");

            HttpHeaders headers =
                    new HttpHeaders();

            headers.set(
                    "X-User-Id",
                    userId.toString()
            );

            HttpEntity<Void> requestEntity =
                    new HttpEntity<>(
                            null,
                            headers
                    );

            return restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    requestEntity,
                    VisitorResponse.class
            ).getBody();

        } catch (Exception e) {

            return null;
        }
    }


    // =========================
    // GET EVENT DETAILS
    // =========================

    private Map<String, Object> getEventDetails(
            Long eventId
    ) {

        try {

            String url =
                    serviceUrl(eventServiceUrl, "/api/events/")
                            + eventId;

            return restTemplate.getForObject(
                    url,
                    Map.class
            );

        } catch (Exception e) {

            return null;
        }
    }

    private String serviceUrl(String baseUrl, String path) {
        return baseUrl.replaceAll("/+$", "") + path;
    }
}
