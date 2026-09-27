package com.kaarigarexpo.event_service.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "entry_tickets",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_ticket_code", columnNames = "ticket_code"),
                @UniqueConstraint(name = "uk_event_ticket_owner", columnNames = {"event_id", "user_id", "attendee_type"})
        }
)
public class EntryTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_code", nullable = false, length = 36)
    private String ticketCode;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "attendee_type", nullable = false, length = 20)
    private String attendeeType;

    private String attendeeName;
    private String attendeePhone;
    private String attendeeEmail;

    @Column(nullable = false)
    private boolean checkedIn;

    private LocalDateTime issuedAt;
    private LocalDateTime checkedInAt;

    @PrePersist
    void onCreate() {
        issuedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getTicketCode() { return ticketCode; }
    public void setTicketCode(String ticketCode) { this.ticketCode = ticketCode; }
    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getAttendeeType() { return attendeeType; }
    public void setAttendeeType(String attendeeType) { this.attendeeType = attendeeType; }
    public String getAttendeeName() { return attendeeName; }
    public void setAttendeeName(String attendeeName) { this.attendeeName = attendeeName; }
    public String getAttendeePhone() { return attendeePhone; }
    public void setAttendeePhone(String attendeePhone) { this.attendeePhone = attendeePhone; }
    public String getAttendeeEmail() { return attendeeEmail; }
    public void setAttendeeEmail(String attendeeEmail) { this.attendeeEmail = attendeeEmail; }
    public boolean isCheckedIn() { return checkedIn; }
    public void setCheckedIn(boolean checkedIn) { this.checkedIn = checkedIn; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public LocalDateTime getCheckedInAt() { return checkedInAt; }
    public void setCheckedInAt(LocalDateTime checkedInAt) { this.checkedInAt = checkedInAt; }
}
