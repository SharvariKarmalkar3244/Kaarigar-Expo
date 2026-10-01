package com.kaarigarexpo.event_service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 80)
    private String action;
    @Column(nullable = false, length = 80)
    private String entityType;
    private Long entityId;
    @Column(length = 254)
    private String actorEmail;
    @Column(columnDefinition = "TEXT")
    private String details;
    @Column(nullable = false)
    private LocalDateTime occurredAt;

    protected AuditLog() {}
    public AuditLog(String action, String entityType, Long entityId, String actorEmail, String details) {
        this.action = action; this.entityType = entityType; this.entityId = entityId;
        this.actorEmail = actorEmail; this.details = details; this.occurredAt = LocalDateTime.now();
    }
    public Long getId() { return id; }
    public String getAction() { return action; }
    public String getEntityType() { return entityType; }
    public Long getEntityId() { return entityId; }
    public String getActorEmail() { return actorEmail; }
    public String getDetails() { return details; }
    public LocalDateTime getOccurredAt() { return occurredAt; }
}
