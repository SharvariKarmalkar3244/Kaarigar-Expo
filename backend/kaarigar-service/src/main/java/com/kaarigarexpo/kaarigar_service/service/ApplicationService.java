package com.kaarigarexpo.kaarigar_service.service;

import com.kaarigarexpo.kaarigar_service.dto.EventApplicationRequest;
import com.kaarigarexpo.kaarigar_service.dto.EventApplicationResponse;
import com.kaarigarexpo.kaarigar_service.dto.InternalTicketRequest;
import com.kaarigarexpo.kaarigar_service.dto.InternalTicketResponse;
import com.kaarigarexpo.kaarigar_service.entity.ApplicationStatus;
import com.kaarigarexpo.kaarigar_service.entity.EventApplication;
import com.kaarigarexpo.kaarigar_service.repository.ArtisanProfileRepository;
import com.kaarigarexpo.kaarigar_service.repository.EventApplicationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationService {

    private final EventApplicationRepository applicationRepository;
    private final ArtisanProfileRepository profileRepository;
    private final RestTemplate restTemplate;

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Value("${services.event-url:http://localhost:8082}")
    private String eventServiceUrl;

    @Value("${services.auth-url:http://localhost:8081}")
    private String authServiceUrl;

    public ApplicationService(
            EventApplicationRepository applicationRepository,
            ArtisanProfileRepository profileRepository,
            RestTemplate restTemplate
    ) {
        this.applicationRepository = applicationRepository;
        this.profileRepository = profileRepository;
        this.restTemplate = restTemplate;
    }

    public EventApplicationResponse apply(
            Long userId,
            EventApplicationRequest request
    ) {

        if (!profileRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Complete your Kaarigar profile before applying for an event"
            );
        }

        if (applicationRepository.existsByUserIdAndEventId(userId, request.eventId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "You have already applied to this event"
            );
        }

        String eventTitle = fetchUpcomingEventTitle(request.eventId());
        EventApplication application = new EventApplication();

        application.setUserId(userId);
        application.setEventId(request.eventId());
        application.setMessage(request.message());
        application.setStatus(ApplicationStatus.PENDING);

        application.setEventTitle(eventTitle);

        return mapToResponse(
                applicationRepository.save(application)
        );
    }

    public List<EventApplicationResponse> getMyApplications(Long userId) {
        return applicationRepository
                .findByUserIdOrderByAppliedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<EventApplicationResponse> getApplicationsByEvent(Long eventId) {
        return applicationRepository
                .findByEventIdOrderByAppliedAtDesc(eventId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // =========================================================
    // ADMIN METHODS
    // =========================================================

    public Page<EventApplicationResponse> getPendingApplications(Pageable pageable) {
        return applicationRepository
                .findByStatusOrderByAppliedAtDesc(ApplicationStatus.PENDING, pageable)
                .map(this::mapToResponse);
    }

    public EventApplicationResponse reviewApplication(
            Long applicationId,
            String status,
            String rejectionReason,
            String actorEmail
    ) {

        EventApplication application = applicationRepository
                .findById(applicationId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Application not found"
                        )
                );

        ApplicationStatus applicationStatus;

        try {
            applicationStatus = ApplicationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Status must be APPROVED or REJECTED"
            );
        }

        if (applicationStatus == ApplicationStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Application must be approved or rejected"
            );
        }

        if (applicationStatus == ApplicationStatus.REJECTED && (rejectionReason == null || rejectionReason.isBlank())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Rejection reason is required"
            );
        }

        ApplicationStatus previousStatus = application.getStatus();
        String previousTicketCode = application.getEntryTicketCode();
        if (applicationStatus == ApplicationStatus.APPROVED) {
            var profile = profileRepository.findByUserId(application.getUserId()).orElse(null);
            InternalTicketResponse ticket = issueEntryTicket(application, profile);
            application.setEntryTicketCode(ticket.ticketCode());
        } else if (previousTicketCode != null) {
            revokeEntryTicket(previousTicketCode);
            application.setEntryTicketCode(null);
        }

        application.setStatus(applicationStatus);
        application.setRejectionReason(
                applicationStatus == ApplicationStatus.REJECTED ? rejectionReason : null
        );
        application.setReviewedAt(LocalDateTime.now());

        EventApplication savedApplication = applicationRepository.save(application);
        recordApplicationReview(savedApplication, previousStatus, actorEmail);
        return mapToResponse(savedApplication);
    }

    private void recordApplicationReview(EventApplication application, ApplicationStatus previousStatus, String actorEmail) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalServiceSecret);
            String details = "eventId=" + application.getEventId()
                    + "; userId=" + application.getUserId()
                    + "; status=" + previousStatus + " -> " + application.getStatus();
            restTemplate.exchange(
                    serviceUrl(eventServiceUrl, "/internal/events/audit"),
                    HttpMethod.POST,
                    new HttpEntity<>(Map.of(
                            "action", "APPLICATION_REVIEWED",
                            "entityType", "APPLICATION",
                            "entityId", application.getId(),
                            "actorEmail", actorEmail == null ? "Admin" : actorEmail,
                            "details", details
                    ), headers),
                    Void.class
            );
        } catch (RestClientException exception) {
            System.getLogger(ApplicationService.class.getName()).log(
                    System.Logger.Level.WARNING,
                    "Application review was saved, but its audit entry could not be recorded",
                    exception
            );
        }
    }

    // =========================================================
    // RESPONSE MAPPING
    // =========================================================

    private String fetchUpcomingEventTitle(Long eventId) {
        Map<?, ?> response;
        try {
            response = restTemplate.getForObject(serviceUrl(eventServiceUrl, "/api/events/" + eventId), Map.class);
        } catch (HttpClientErrorException.NotFound exception) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to verify event availability right now");
        }
        if (response == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        String status = String.valueOf(response.get("status"));
        if (!"UPCOMING".equalsIgnoreCase(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Applications are available only for upcoming events");
        }
        Object title = response.get("title");
        return title == null ? "Event #" + eventId : title.toString();
    }

    private EventApplicationResponse mapToResponse(
            EventApplication application
    ) {

        var profile = profileRepository.findByUserId(application.getUserId()).orElse(null);
        String kaarigarName = profile != null ? profile.getName() : fetchAccountDisplayName(application.getUserId());

        String eventTitle = application.getEventTitle() != null
                ? application.getEventTitle()
                : "Event #" + application.getEventId();

        return new EventApplicationResponse(
                application.getId(),
                application.getUserId(),
                application.getEventId(),
                kaarigarName,
                eventTitle,
                application.getStatus(),
                application.getMessage(),
                application.getRejectionReason(),
                application.getEntryTicketCode(),
                application.getAppliedAt(),
                application.getReviewedAt(),
                profile != null ? profile.getPhone() : null,
                profile != null ? profile.getLocation() : null,
                profile != null ? profile.getPhotoUrl() : null,
                profile != null ? profile.getWorkImageUrls() : List.of()
        );
    }

    private String fetchAccountDisplayName(Long userId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalServiceSecret);
            Map<?, ?> response = restTemplate.exchange(
                    serviceUrl(authServiceUrl, "/internal/accounts/" + userId + "/display-name"),
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            ).getBody();
            Object name = response == null ? null : response.get("name");
            if (name != null && !name.toString().isBlank()) return name.toString();
        } catch (Exception ignored) {
            // Keep application lists available even if account lookup is temporarily unavailable.
        }
        return "Kaarigar #" + userId;
    }

    private InternalTicketResponse issueEntryTicket(EventApplication application,
            com.kaarigarexpo.kaarigar_service.entity.ArtisanProfile profile) {
        String url = serviceUrl(eventServiceUrl, "/internal/events/" + application.getEventId() + "/tickets");
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalServiceSecret);
        InternalTicketRequest body = new InternalTicketRequest(
                application.getUserId(),
                "KAARIGAR",
                profile != null ? profile.getName() : "Kaarigar #" + application.getUserId(),
                profile != null ? profile.getPhone() : null,
                profile != null ? profile.getEmail() : null
        );
        InternalTicketResponse response = restTemplate.exchange(
                url, HttpMethod.POST, new HttpEntity<>(body, headers), InternalTicketResponse.class
        ).getBody();
        if (response == null || response.ticketCode() == null) {
            throw new IllegalStateException("Unable to issue the Kaarigar entry ticket");
        }
        return response;
    }

    private void revokeEntryTicket(String ticketCode) {
        String url = serviceUrl(eventServiceUrl, "/internal/events/tickets/" + ticketCode);
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Internal-Secret", internalServiceSecret);
        restTemplate.exchange(url, HttpMethod.DELETE, new HttpEntity<>(headers), Void.class);
    }

    private String serviceUrl(String baseUrl, String path) {
        return baseUrl.replaceAll("/+$", "") + path;
    }
}
