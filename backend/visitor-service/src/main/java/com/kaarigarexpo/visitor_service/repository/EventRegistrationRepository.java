package com.kaarigarexpo.visitor_service.repository;

import com.kaarigarexpo.visitor_service.entity.EventRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventRegistrationRepository
        extends JpaRepository<EventRegistration, Long> {

    boolean existsByUserIdAndEventId(
            Long userId,
            Long eventId
    );

    List<EventRegistration>
    findByUserIdOrderByRegisteredAtDesc(
            Long userId
    );

    List<EventRegistration>
    findByEventIdOrderByRegisteredAtAsc(
            Long eventId
    );
}