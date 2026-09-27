package com.kaarigarexpo.event_service.repository;

import com.kaarigarexpo.event_service.entity.Event;
import com.kaarigarexpo.event_service.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    List<Event> findByStatusOrderByStartDateAsc(EventStatus status);

    List<Event> findByStartDateGreaterThanEqualOrderByStartDateAsc(
            LocalDate date
    );

    @Modifying
    @Query("""
            UPDATE Event e
            SET e.registeredCount = e.registeredCount + 1
            WHERE e.id = :eventId
            AND e.registeredCount < e.capacity
            AND e.status = com.kaarigarexpo.event_service.entity.EventStatus.UPCOMING
            """)
    int reserveSlot(@Param("eventId") Long eventId);

    @Modifying
    @Query("""
            UPDATE Event e
            SET e.registeredCount = e.registeredCount - 1
            WHERE e.id = :eventId
            AND e.registeredCount > 0
            """)
    int releaseSlot(@Param("eventId") Long eventId);
}