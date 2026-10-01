package com.kaarigarexpo.kaarigar_service.repository;

import com.kaarigarexpo.kaarigar_service.entity.ApplicationStatus;
import com.kaarigarexpo.kaarigar_service.entity.EventApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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

    Page<EventApplication> findByStatusOrderByAppliedAtDesc(
            ApplicationStatus status,
            Pageable pageable
    );

    List<EventApplication> findByEventIdOrderByAppliedAtDesc(
            Long eventId
    );
}
