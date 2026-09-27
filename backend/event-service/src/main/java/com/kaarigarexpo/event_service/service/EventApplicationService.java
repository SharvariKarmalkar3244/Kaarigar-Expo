package com.kaarigarexpo.event_service.service;

import com.kaarigarexpo.event_service.dto.EventApplicationRequest;
import com.kaarigarexpo.event_service.entity.ApplicationStatus;
import com.kaarigarexpo.event_service.entity.EventApplication;
import com.kaarigarexpo.event_service.repository.EventApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class EventApplicationService {

    private final EventApplicationRepository repository;

    public EventApplicationService(
            EventApplicationRepository repository
    ) {
        this.repository = repository;
    }

    /**
     * Kaarigar applies for an event.
     *
     * New applications are created with PENDING status.
     */
    @Transactional
    public EventApplication applyForEvent(
            EventApplicationRequest request
    ) {

        // Validate request
        if (request.getEventId() == null) {
            throw new IllegalArgumentException(
                    "Event ID is required"
            );
        }

        if (request.getKaarigarId() == null) {
            throw new IllegalArgumentException(
                    "Kaarigar ID is required"
            );
        }

        // Prevent duplicate application
        if (repository.existsByEventIdAndKaarigarId(
                request.getEventId(),
                request.getKaarigarId()
        )) {

            throw new IllegalStateException(
                    "Kaarigar has already applied for this event"
            );
        }

        // Create new application
        EventApplication application =
                new EventApplication(
                        request.getEventId(),
                        request.getKaarigarId()
                );

        // New applications are always PENDING
        application.setStatus(ApplicationStatus.PENDING);

        // Optional remarks submitted by Kaarigar
        application.setRemarks(
                request.getRemarks()
        );

        return repository.save(application);
    }

    /**
     * Get all applications submitted by a Kaarigar.
     *
     * Used by:
     * Kaarigar Dashboard
     * My Applications
     * Track Application Status
     */
    @Transactional(readOnly = true)
    public List<EventApplication> getApplicationsByKaarigar(
            Long kaarigarId
    ) {

        if (kaarigarId == null) {
            throw new IllegalArgumentException(
                    "Kaarigar ID is required"
            );
        }

        return repository.findByKaarigarIdOrderByAppliedAtDesc(
                kaarigarId
        );
    }

    /**
     * Get all applications submitted for an event.
     *
     * Used by:
     * Admin
     * Event management
     */
    @Transactional(readOnly = true)
    public List<EventApplication> getApplicationsByEvent(
            Long eventId
    ) {

        if (eventId == null) {
            throw new IllegalArgumentException(
                    "Event ID is required"
            );
        }

        return repository.findByEventIdOrderByAppliedAtDesc(
                eventId
        );
    }

    /**
     * Get applications of a Kaarigar by status.
     *
     * Example:
     * PENDING applications
     * APPROVED applications
     * REJECTED applications
     */
    @Transactional(readOnly = true)
    public List<EventApplication> getApplicationsByKaarigarAndStatus(
            Long kaarigarId,
            ApplicationStatus status
    ) {

        if (kaarigarId == null) {
            throw new IllegalArgumentException(
                    "Kaarigar ID is required"
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Application status is required"
            );
        }

        return repository
                .findByKaarigarIdAndStatusOrderByAppliedAtDesc(
                        kaarigarId,
                        status
                );
    }

    /**
     * Get applications for an event by status.
     *
     * Useful for Admin:
     * /pending
     * /approved
     * /rejected
     */
    @Transactional(readOnly = true)
    public List<EventApplication> getApplicationsByEventAndStatus(
            Long eventId,
            ApplicationStatus status
    ) {

        if (eventId == null) {
            throw new IllegalArgumentException(
                    "Event ID is required"
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Application status is required"
            );
        }

        return repository
                .findByEventIdAndStatusOrderByAppliedAtDesc(
                        eventId,
                        status
                );
    }

    /**
     * Get a single application.
     */
    @Transactional(readOnly = true)
    public EventApplication getApplication(
            Long id
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Application ID is required"
            );
        }

        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Application not found"
                        )
                );
    }

    /**
     * Check whether a Kaarigar has already applied
     * for an event.
     */
    @Transactional(readOnly = true)
    public boolean hasApplied(
            Long eventId,
            Long kaarigarId
    ) {

        if (eventId == null || kaarigarId == null) {
            return false;
        }

        return repository.existsByEventIdAndKaarigarId(
                eventId,
                kaarigarId
        );
    }

    /**
     * Admin updates application status.
     *
     * Possible statuses:
     * PENDING
     * APPROVED
     * REJECTED
     */
    @Transactional
    public EventApplication updateStatus(
            Long id,
            ApplicationStatus status,
            String remarks
    ) {

        if (id == null) {
            throw new IllegalArgumentException(
                    "Application ID is required"
            );
        }

        if (status == null) {
            throw new IllegalArgumentException(
                    "Application status is required"
            );
        }

        EventApplication application =
                getApplication(id);

        ApplicationStatus currentStatus =
                application.getStatus();

        /*
         * Prevent changing an already approved application
         * directly to another status.
         *
         * Similarly, prevent changing a rejected application
         * unless it is explicitly moved back to PENDING.
         */
        if (currentStatus == ApplicationStatus.APPROVED
                && status != ApplicationStatus.APPROVED) {

            throw new IllegalStateException(
                    "An approved application cannot be changed"
            );
        }

        if (currentStatus == ApplicationStatus.REJECTED
                && status == ApplicationStatus.APPROVED) {

            throw new IllegalStateException(
                    "A rejected application cannot be directly approved"
            );
        }

        application.setStatus(status);

        // Update remarks only when supplied
        if (remarks != null && !remarks.trim().isEmpty()) {
            application.setRemarks(remarks);
        }

        /*
         * reviewedAt should only be set when the application
         * is actually reviewed.
         */
        if (status == ApplicationStatus.APPROVED
                || status == ApplicationStatus.REJECTED) {

            application.setReviewedAt(
                    LocalDateTime.now()
            );
        }

        /*
         * If moved back to PENDING, it is no longer considered
         * reviewed.
         */
        if (status == ApplicationStatus.PENDING) {
            application.setReviewedAt(null);
        }

        return repository.save(application);
    }

    /**
     * Count total applications for an event.
     */
    @Transactional(readOnly = true)
    public long countApplicationsByEvent(
            Long eventId
    ) {

        return repository.countByEventId(eventId);
    }

    /**
     * Count applications for an event by status.
     */
    @Transactional(readOnly = true)
    public long countApplicationsByEventAndStatus(
            Long eventId,
            ApplicationStatus status
    ) {

        return repository.countByEventIdAndStatus(
                eventId,
                status
        );
    }

    /**
     * Count all applications submitted by a Kaarigar.
     */
    @Transactional(readOnly = true)
    public long countApplicationsByKaarigar(
            Long kaarigarId
    ) {

        return repository.countByKaarigarId(
                kaarigarId
        );
    }
}