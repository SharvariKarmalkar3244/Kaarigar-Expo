package com.kaarigarexpo.event_service.service;

import com.kaarigarexpo.event_service.dto.EventParticipantResponse;
import com.kaarigarexpo.event_service.dto.AdminAnalyticsResponse;
import com.kaarigarexpo.event_service.dto.EventRequest;
import com.kaarigarexpo.event_service.dto.EventResponse;
import com.kaarigarexpo.event_service.dto.EventVisitorResponse;
import com.kaarigarexpo.event_service.dto.EntryTicketRequest;
import com.kaarigarexpo.event_service.dto.EntryTicketResponse;
import com.kaarigarexpo.event_service.entity.Event;
import com.kaarigarexpo.event_service.entity.EventApplication;
import com.kaarigarexpo.event_service.entity.EventStatus;
import com.kaarigarexpo.event_service.entity.ApplicationStatus;
import com.kaarigarexpo.event_service.entity.EntryTicket;
import com.kaarigarexpo.event_service.exception.CapacityFullException;
import com.kaarigarexpo.event_service.exception.EventNotFoundException;
import com.kaarigarexpo.event_service.repository.EventApplicationRepository;
import com.kaarigarexpo.event_service.repository.EventRepository;
import com.kaarigarexpo.event_service.repository.EntryTicketRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepository eventRepository;
    private final EventApplicationRepository eventApplicationRepository;
    private final RestTemplate restTemplate;
    private final EntryTicketRepository entryTicketRepository;

    @Value("${internal.service.secret}")
    private String internalServiceSecret;

    @Value("${services.auth-url:http://localhost:8081}")
    private String authServiceUrl;

    @Value("${services.kaarigar-url:http://localhost:8083}")
    private String kaarigarServiceUrl;

    @Value("${services.visitor-url:http://localhost:8084}")
    private String visitorServiceUrl;

    public EventService(
            EventRepository eventRepository,
            EventApplicationRepository eventApplicationRepository,
            RestTemplate restTemplate,
            EntryTicketRepository entryTicketRepository
    ) {
        this.eventRepository = eventRepository;
        this.eventApplicationRepository = eventApplicationRepository;
        this.restTemplate = restTemplate;
        this.entryTicketRepository = entryTicketRepository;
    }

    // =========================
    // CREATE
    // =========================

    @CacheEvict(cacheNames = {"events", "event"}, allEntries = true)
    public EventResponse createEvent(EventRequest request) {

        validateDates(request);

        Event event = new Event();

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setLocation(request.location());
        event.setCity(request.city());
        event.setCraftType(request.craftType());
        event.setImageUrl(request.imageUrl());
        event.setCapacity(request.capacity());
        event.setRegisteredCount(0);

        if (request.status() != null) {
            event.setStatus(request.status());
        } else {
            event.setStatus(EventStatus.UPCOMING);
        }

        Event savedEvent = eventRepository.save(event);

        return mapToResponse(savedEvent);
    }

    // =========================
    // GET ALL
    // =========================

    @Cacheable("events")
    public Page<EventResponse> getEvents(EventStatus status, String city, String query,
                                         LocalDate fromDate, LocalDate toDate, String craftType,
                                         boolean availableOnly, Pageable pageable) {
        String normalizedCity = city == null || city.isBlank() ? "" : city.trim();
        String normalizedQuery = query == null || query.isBlank() ? "" : query.trim();
        String normalizedCraftType = craftType == null || craftType.isBlank() ? "" : craftType.trim();
        return eventRepository.searchEvents(status, normalizedCity, normalizedQuery, fromDate, toDate,
                normalizedCraftType, availableOnly, pageable).map(event -> {
            EventStatus calculatedStatus = calculateStatus(event);
            if (event.getStatus() != EventStatus.CANCELLED && event.getStatus() != calculatedStatus) {
                event.setStatus(calculatedStatus);
                eventRepository.save(event);
            }
            return mapToResponse(event);
        });
    }

    public List<EventResponse> getAllEvents() {

        return eventRepository.findAll()
                .stream()
                .map(event -> {

                    EventStatus calculatedStatus =
                            calculateStatus(event);

                    if (event.getStatus() != EventStatus.CANCELLED
                            && event.getStatus() != calculatedStatus) {

                        event.setStatus(calculatedStatus);
                        eventRepository.save(event);
                    }

                    return mapToResponse(event);
                })
                .toList();
    }

    public AdminAnalyticsResponse getAdminAnalytics() {
        long ticketCount = entryTicketRepository.count();
        long checkedInCount = entryTicketRepository.countByCheckedInTrue();
        double attendanceRate = ticketCount == 0 ? 0.0 : checkedInCount * 100.0 / ticketCount;
        List<Event> events = eventRepository.findAll();
        long totalCapacity = events.stream().mapToLong(event -> event.getCapacity() == null ? 0 : event.getCapacity()).sum();
        long registeredCapacity = events.stream().mapToLong(event -> event.getRegisteredCount() == null ? 0 : event.getRegisteredCount()).sum();
        long availableCapacity = Math.max(0, totalCapacity - registeredCapacity);
        double capacityUtilization = totalCapacity == 0 ? 0.0 : registeredCapacity * 100.0 / totalCapacity;
        return new AdminAnalyticsResponse(
                eventRepository.count(),
                eventRepository.countByStatus(EventStatus.UPCOMING),
                eventRepository.countByStatus(EventStatus.ONGOING),
                eventApplicationRepository.count(),
                eventApplicationRepository.countByStatus(ApplicationStatus.PENDING),
                ticketCount,
                checkedInCount,
                Math.round(attendanceRate * 10.0) / 10.0,
                totalCapacity,
                registeredCapacity,
                availableCapacity,
                Math.round(capacityUtilization * 10.0) / 10.0
        );
    }

    // =========================
    // GET UPCOMING
    // =========================

    @Cacheable("events")
    public List<EventResponse> getUpcomingEvents() {

        return eventRepository.findAll()
                .stream()
                .map(event -> {
                    EventStatus status = calculateStatus(event);

                    if (event.getStatus() != EventStatus.CANCELLED
                            && event.getStatus() != status) {
                        event.setStatus(status);
                        eventRepository.save(event);
                    }

                    return event;
                })
                .filter(event ->
                        event.getStatus() == EventStatus.UPCOMING
                )
                .map(this::mapToResponse)
                .toList();
    }

    // =========================
    // GET BY ID
    // =========================

    @Cacheable(cacheNames = "event", key = "#id")
    public EventResponse getEventById(Long id) {

        Event event = findEvent(id);

        EventStatus calculatedStatus = calculateStatus(event);

        if (event.getStatus() != EventStatus.CANCELLED
                && event.getStatus() != calculatedStatus) {

            event.setStatus(calculatedStatus);
            eventRepository.save(event);
        }

        return mapToResponse(event);
    }

    // =========================
    // UPDATE
    // =========================

    @CacheEvict(cacheNames = {"events", "event"}, allEntries = true)
    public EventResponse updateEvent(
            Long id,
            EventRequest request
    ) {

        validateDates(request);

        Event event = findEvent(id);

        event.setTitle(request.title());
        event.setDescription(request.description());
        event.setStartDate(request.startDate());
        event.setEndDate(request.endDate());
        event.setLocation(request.location());
        event.setCity(request.city());
        event.setCraftType(request.craftType());
        event.setImageUrl(request.imageUrl());

        if (request.capacity() < event.getRegisteredCount()) {
            throw new IllegalArgumentException(
                    "Capacity cannot be lower than current registrations"
            );
        }

        event.setCapacity(request.capacity());

        if (request.status() != null) {
            event.setStatus(request.status());
        }

        Event updatedEvent = eventRepository.save(event);

        return mapToResponse(updatedEvent);
    }

    // =========================
    // DELETE
    // =========================

    @CacheEvict(cacheNames = {"events", "event"}, allEntries = true)
    public void deleteEvent(Long id) {

        Event event = findEvent(id);

        eventRepository.delete(event);
    }

    // =========================
    // RESERVE SLOT
    // =========================

    @Transactional
    @CacheEvict(cacheNames = {"events", "event"}, allEntries = true)
    public void reserveSlot(Long eventId) {

        Event event = findEvent(eventId);

        EventStatus calculatedStatus = calculateStatus(event);

        if (event.getStatus() != EventStatus.CANCELLED
                && event.getStatus() != calculatedStatus) {

            event.setStatus(calculatedStatus);
            eventRepository.save(event);
        }

        if (calculatedStatus != EventStatus.UPCOMING) {

            throw new IllegalStateException(
                    "Registration is only available for upcoming events"
            );
        }

        if (event.getRegisteredCount() >= event.getCapacity()) {

            throw new CapacityFullException(
                    "Event capacity is full"
            );
        }

        int updatedRows =
                eventRepository.reserveSlot(eventId);

        if (updatedRows == 0) {

            throw new CapacityFullException(
                    "Unable to reserve an event slot"
            );
        }
    }

    // =========================
    // RELEASE SLOT
    // =========================

    @Transactional
    @CacheEvict(cacheNames = {"events", "event"}, allEntries = true)
    public void releaseSlot(Long eventId) {

        eventRepository.releaseSlot(eventId);
    }

    // =========================
    // HELPER
    // =========================

    private Event findEvent(Long id) {

        return eventRepository.findById(id)
                .orElseThrow(() ->
                        new EventNotFoundException(
                                "Event not found with id: " + id
                        )
                );
    }

    private void validateDates(EventRequest request) {

        if (request.endDate()
                .isBefore(request.startDate())) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }

    private EventStatus calculateStatus(Event event) {

        LocalDate today = LocalDate.now();

        if (event.getStatus() == EventStatus.CANCELLED) {
            return EventStatus.CANCELLED;
        }

        // Guard against null dates in database
        if (event.getStartDate() == null || event.getEndDate() == null) {
            return event.getStatus() != null ? event.getStatus() : EventStatus.UPCOMING;
        }

        if (today.isBefore(event.getStartDate())) {
            return EventStatus.UPCOMING;
        }

        if (!today.isAfter(event.getEndDate())) {
            return EventStatus.ONGOING;
        }

        return EventStatus.COMPLETED;
    }

    private EventResponse mapToResponse(Event event) {

        int capacity = event.getCapacity() != null ? event.getCapacity() : 0;
        int registeredCount = event.getRegisteredCount() != null ? event.getRegisteredCount() : 0;
        int availableSlots = Math.max(0, capacity - registeredCount);

        return new EventResponse(
                event.getId(),
                event.getTitle(),
                event.getDescription(),
                event.getStartDate(),
                event.getEndDate(),
                event.getLocation(),
                event.getCity(),
                event.getCraftType(),
                event.getImageUrl(),
                capacity,
                registeredCount,
                availableSlots,
                event.getStatus(),
                event.getCreatedAt()
        );
    }

    @Transactional
    public EntryTicketResponse issueTicket(Long eventId, EntryTicketRequest request) {
        findEvent(eventId);
        String attendeeType = request.attendeeType().trim().toUpperCase();
        if (!"VISITOR".equals(attendeeType) && !"KAARIGAR".equals(attendeeType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendee type must be VISITOR or KAARIGAR");
        }

        EntryTicket ticket = entryTicketRepository
                .findByEventIdAndUserIdAndAttendeeType(eventId, request.userId(), attendeeType)
                .orElseGet(() -> {
                    EntryTicket created = new EntryTicket();
                    created.setTicketCode(UUID.randomUUID().toString());
                    created.setEventId(eventId);
                    created.setUserId(request.userId());
                    created.setAttendeeType(attendeeType);
                    return created;
                });

        ticket.setAttendeeName(request.attendeeName());
        ticket.setAttendeePhone(request.attendeePhone());
        ticket.setAttendeeEmail(request.attendeeEmail());
        return mapTicket(entryTicketRepository.save(ticket));
    }

    @Transactional
    public EntryTicketResponse verifyTicket(String ticketCode, Long expectedEventId) {
        EntryTicket ticket = entryTicketRepository.findByTicketCodeForUpdate(ticketCode.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found"));
        if (!ticket.getEventId().equals(expectedEventId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This ticket is for a different event");
        }
        boolean alreadyCheckedIn = ticket.isCheckedIn();
        if (!ticket.isCheckedIn()) {
            ticket.setCheckedIn(true);
            ticket.setCheckedInAt(LocalDateTime.now());
            ticket = entryTicketRepository.save(ticket);
        }
        return mapTicket(ticket, alreadyCheckedIn);
    }

    public List<EntryTicketResponse> getEventTickets(Long eventId) {
        findEvent(eventId);
        return entryTicketRepository.findByEventIdOrderByIssuedAtDesc(eventId)
                .stream().map(this::mapTicket).toList();
    }

    @Transactional
    public void revokeTicket(String ticketCode) {
        entryTicketRepository.findByTicketCodeForUpdate(ticketCode)
                .ifPresent(entryTicketRepository::delete);
    }

    private EntryTicketResponse mapTicket(EntryTicket ticket) {
        return mapTicket(ticket, false);
    }

    private EntryTicketResponse mapTicket(EntryTicket ticket, boolean alreadyCheckedIn) {
        return new EntryTicketResponse(
                ticket.getId(), ticket.getTicketCode(), ticket.getEventId(), ticket.getUserId(),
                ticket.getAttendeeType(), resolveAttendeeName(ticket), ticket.getAttendeePhone(), ticket.getAttendeeEmail(),
                ticket.isCheckedIn(), alreadyCheckedIn, ticket.getIssuedAt(), ticket.getCheckedInAt()
        );
    }

    /**
     * Older Kaarigar tickets may have been issued before the artisan completed a profile,
     * leaving a generated label such as "Kaarigar #4" saved on the ticket. Resolve only
     * those generated labels so the check-in list and scan result can show the real name.
     */
    private String resolveAttendeeName(EntryTicket ticket) {
        String savedName = ticket.getAttendeeName();
        Long userId = ticket.getUserId();
        if (!"KAARIGAR".equalsIgnoreCase(ticket.getAttendeeType()) || userId == null
                || !isGeneratedKaarigarName(savedName, userId)) {
            return savedName;
        }

        try {
            Map<?, ?> profile = restTemplate.getForObject(
                    serviceUrl(kaarigarServiceUrl, "/api/kaarigars/by-user/" + userId), Map.class);
            Object profileName = profile == null ? null : profile.get("name");
            if (profileName != null && !profileName.toString().isBlank()) {
                return profileName.toString();
            }
        } catch (Exception ignored) {
            // Account lookup below still provides a useful name if a profile is unavailable.
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Internal-Secret", internalServiceSecret);
            Map<?, ?> account = restTemplate.exchange(
                    serviceUrl(authServiceUrl, "/internal/accounts/" + userId + "/display-name"),
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    Map.class
            ).getBody();
            Object accountName = account == null ? null : account.get("name");
            if (accountName != null && !accountName.toString().isBlank()) {
                return accountName.toString();
            }
        } catch (Exception ignored) {
            // Keep the issued ticket readable if account data is temporarily unavailable.
        }
        return savedName;
    }

    private boolean isGeneratedKaarigarName(String name, Long userId) {
        return name == null || name.isBlank()
                || name.equalsIgnoreCase("Kaarigar")
                || name.equalsIgnoreCase("Kaarigar #" + userId);
    }

    // =========================
    // CREATE APPLICATION
    // =========================

    public void createApplication(Long eventId, Long kaarigarId) {

        findEvent(eventId);

        if (eventApplicationRepository.existsByEventIdAndKaarigarId(eventId, kaarigarId)) {
            throw new RuntimeException("Application already exists for this event and kaarigar");
        }

        EventApplication application = new EventApplication();
        application.setEventId(eventId);
        application.setKaarigarId(kaarigarId);
        application.setStatus(com.kaarigarexpo.event_service.entity.ApplicationStatus.PENDING);

        eventApplicationRepository.save(application);
    }

    // =========================
    // GET EVENT PARTICIPANTS
    // =========================

    public List<EventParticipantResponse> getEventParticipants(Long eventId) {

        findEvent(eventId);

        List<EventParticipantResponse> participants = new ArrayList<>();

        try {
            String kaarigarAppUrl = serviceUrl(kaarigarServiceUrl, "/api/kaarigars/applications/event/" + eventId);
            var response = restTemplate.getForObject(kaarigarAppUrl, Object.class);

            if (response instanceof List) {
                List<?> applications = (List<?>) response;

                for (Object appObj : applications) {
                    if (appObj instanceof Map<?, ?> appMap) {
                        String status = appMap.get("status") != null ? appMap.get("status").toString() : "";

                        if ("APPROVED".equalsIgnoreCase(status)) {
                            Long id = appMap.get("id") != null ? Long.valueOf(appMap.get("id").toString()) : null;
                            Long userId = appMap.get("userId") != null ? Long.valueOf(appMap.get("userId").toString()) : null;

                            String kaarigarName = appMap.get("kaarigarName") != null ? appMap.get("kaarigarName").toString() : "Kaarigar";
                            String craft = "Artisan";
                            String location = "";
                            String photoUrl = null;
                            String description = null;
                            List<String> workImageUrls = List.of();

                            if (userId != null) {
                                try {
                                    String profileUrl = serviceUrl(kaarigarServiceUrl, "/api/kaarigars/by-user/" + userId);
                                    var profileResponse = restTemplate.getForObject(profileUrl, Map.class);
                                    if (profileResponse != null) {
                                        craft = profileResponse.get("craft") != null ? profileResponse.get("craft").toString() : craft;
                                        location = profileResponse.get("location") != null ? profileResponse.get("location").toString() : location;
                                        photoUrl = profileResponse.get("photoUrl") != null ? profileResponse.get("photoUrl").toString() : null;
                                        description = profileResponse.get("description") != null ? profileResponse.get("description").toString() : null;
                                        if (profileResponse.get("workImageUrls") instanceof List<?> images) {
                                            workImageUrls = images.stream().map(Object::toString).toList();
                                        }
                                    }
                                } catch (Exception ignored) {}
                            }

                            LocalDateTime appliedAt = appMap.get("appliedAt") != null ? LocalDateTime.parse(appMap.get("appliedAt").toString()) : LocalDateTime.now();

                            participants.add(new EventParticipantResponse(
                                    id,
                                    userId,
                                    kaarigarName,
                                    craft,
                                    location,
                                    status,
                                    appliedAt,
                                    photoUrl,
                                    workImageUrls,
                                    description
                            ));
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error fetching event applications from kaarigar-service: " + e.getMessage());
        }

        return participants;
    }

    // =========================
    // GET EVENT REGISTRATIONS
    // =========================

    public List<EventVisitorResponse> getEventRegistrations(Long eventId) {

        Event event = findEvent(eventId);

        try {
            String url = serviceUrl(visitorServiceUrl, "/api/visitors/registrations/event/" + eventId);
            var response = restTemplate.getForObject(url, Object.class);

            if (response instanceof List) {
                List<?> registrations = (List<?>) response;
                String eventTitle = event.getTitle();
                return registrations.stream()
                        .map(registration -> mapToVisitorResponse(registration, eventTitle))
                        .collect(Collectors.toList());
            }
        } catch (Exception e) {
            return List.of();
        }

        return List.of();
    }

    private EventVisitorResponse mapToVisitorResponse(Object registration, String eventTitle) {

        if (registration instanceof java.util.Map) {
            java.util.Map<?, ?> map = (java.util.Map<?, ?>) registration;
            return new EventVisitorResponse(
                    map.get("id") != null ? Long.valueOf(map.get("id").toString()) : null,
                    map.get("userId") != null ? Long.valueOf(map.get("userId").toString()) : null,
                    map.get("visitorName") != null ? map.get("visitorName").toString() : "Unknown",
                    map.get("email") != null ? map.get("email").toString() : "—",
                    map.get("phone") != null ? map.get("phone").toString() : "—",
                    map.get("registeredAt") != null ? LocalDateTime.parse(map.get("registeredAt").toString()) : null,
                    eventTitle,
                    map.get("photoUrl") != null ? map.get("photoUrl").toString() : null
            );
        }

        return new EventVisitorResponse(null, null, "Unknown", "—", "—", null, eventTitle, null);
    }

    private String serviceUrl(String baseUrl, String path) {
        return baseUrl.replaceAll("/+$", "") + path;
    }
}
