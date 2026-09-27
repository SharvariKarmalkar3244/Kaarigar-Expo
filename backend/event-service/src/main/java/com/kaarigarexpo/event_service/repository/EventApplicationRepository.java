package com.kaarigarexpo.event_service.repository;

import com.kaarigarexpo.event_service.entity.ApplicationStatus;
import com.kaarigarexpo.event_service.entity.EventApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EventApplicationRepository
        extends JpaRepository<EventApplication, Long> {

    // Check whether a Kaarigar has already applied for an event
    Optional<EventApplication> findByEventIdAndKaarigarId(
            Long eventId,
            Long kaarigarId
    );

    // Get all applications submitted by a particular Kaarigar
    List<EventApplication> findByKaarigarIdOrderByAppliedAtDesc(
            Long kaarigarId
    );

    // Get all applications for a particular event
    List<EventApplication> findByEventIdOrderByAppliedAtDesc(
            Long eventId
    );


    // Get applications of a Kaarigar filtered by status
    List<EventApplication> findByKaarigarIdAndStatusOrderByAppliedAtDesc(
            Long kaarigarId,
            ApplicationStatus status
    );

    // Get applications for an event filtered by status
    List<EventApplication> findByEventIdAndStatusOrderByAppliedAtDesc(
            Long eventId,
            ApplicationStatus status
    );

    // Count applications for an event
    long countByEventId(Long eventId);

    // Count applications by status for an event
    long countByEventIdAndStatus(
            Long eventId,
            ApplicationStatus status
    );

    // Count applications submitted by a Kaarigar
    long countByKaarigarId(Long kaarigarId);

    // Check duplicate application
    boolean existsByEventIdAndKaarigarId(
            Long eventId,
            Long kaarigarId
    );
}