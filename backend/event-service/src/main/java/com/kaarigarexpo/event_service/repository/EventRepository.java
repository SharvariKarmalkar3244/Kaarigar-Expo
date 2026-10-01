package com.kaarigarexpo.event_service.repository;

import com.kaarigarexpo.event_service.entity.Event;
import com.kaarigarexpo.event_service.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    long countByStatus(EventStatus status);

    @Query("""
            SELECT e FROM Event e
            WHERE (:status IS NULL
              OR (:status = com.kaarigarexpo.event_service.entity.EventStatus.CANCELLED AND e.status = :status)
              OR (:status = com.kaarigarexpo.event_service.entity.EventStatus.UPCOMING AND e.status <> com.kaarigarexpo.event_service.entity.EventStatus.CANCELLED AND e.startDate > CURRENT_DATE)
              OR (:status = com.kaarigarexpo.event_service.entity.EventStatus.ONGOING AND e.status <> com.kaarigarexpo.event_service.entity.EventStatus.CANCELLED AND e.startDate <= CURRENT_DATE AND e.endDate >= CURRENT_DATE)
              OR (:status = com.kaarigarexpo.event_service.entity.EventStatus.COMPLETED AND e.status <> com.kaarigarexpo.event_service.entity.EventStatus.CANCELLED AND e.endDate < CURRENT_DATE))
              AND (:city IS NULL OR lower(coalesce(e.city, '')) LIKE lower(concat('%', :city, '%'))
                   OR lower(e.location) LIKE lower(concat('%', :city, '%')))
              AND (:fromDate IS NULL OR e.startDate >= :fromDate)
              AND (:toDate IS NULL OR e.startDate <= :toDate)
              AND (:craftType IS NULL OR lower(coalesce(e.craftType, '')) LIKE lower(concat('%', :craftType, '%')))
              AND (:availableOnly = false OR e.registeredCount < e.capacity)
              AND (:query IS NULL OR lower(e.title) LIKE lower(concat('%', :query, '%'))
                   OR lower(e.city) LIKE lower(concat('%', :query, '%'))
                   OR lower(e.location) LIKE lower(concat('%', :query, '%'))
                   OR lower(e.description) LIKE lower(concat('%', :query, '%')))
            """)
    Page<Event> searchEvents(@Param("status") EventStatus status, @Param("city") String city,
                             @Param("query") String query, @Param("fromDate") LocalDate fromDate,
                             @Param("toDate") LocalDate toDate, @Param("craftType") String craftType,
                             @Param("availableOnly") boolean availableOnly, Pageable pageable);

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
