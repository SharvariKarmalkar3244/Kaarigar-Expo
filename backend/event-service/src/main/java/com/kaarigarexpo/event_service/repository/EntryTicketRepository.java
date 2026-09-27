package com.kaarigarexpo.event_service.repository;

import com.kaarigarexpo.event_service.entity.EntryTicket;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EntryTicketRepository extends JpaRepository<EntryTicket, Long> {
    Optional<EntryTicket> findByEventIdAndUserIdAndAttendeeType(Long eventId, Long userId, String attendeeType);
    List<EntryTicket> findByEventIdOrderByIssuedAtDesc(Long eventId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ticket from EntryTicket ticket where ticket.ticketCode = :code")
    Optional<EntryTicket> findByTicketCodeForUpdate(@Param("code") String code);
}
