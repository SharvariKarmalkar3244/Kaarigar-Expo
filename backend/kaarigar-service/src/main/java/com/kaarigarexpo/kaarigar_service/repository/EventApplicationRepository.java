package com.kaarigarexpo.kaarigar_service.repository;

import com.kaarigarexpo.kaarigar_service.entity.ApplicationStatus;
import com.kaarigarexpo.kaarigar_service.entity.EventApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EventApplicationRepository
        extends JpaRepository<EventApplication, Long> {

    boolean existsByUserIdAndEventId(
            Long userId,
            Long eventId
    );

    List<EventApplication> findByUserIdOrderByAppliedAtDesc(
            Long userId
    );

    List<EventApplication> findByStatusOrderByAppliedAtDesc(
            ApplicationStatus status
    );

    List<EventApplication> findByEventIdOrderByAppliedAtDesc(
            Long eventId
    );
}