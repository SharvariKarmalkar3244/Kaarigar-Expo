package com.kaarigarexpo.auth_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "auth_action_tokens")
public class AuthActionToken {
    @Id
    @Column(length = 64)
    private String tokenHash;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 32)
    private String purpose;

    @Column(nullable = false)
    private Instant expiresAt;

    private Instant usedAt;

    protected AuthActionToken() {}

    public AuthActionToken(String tokenHash, Long userId, String purpose, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.userId = userId;
        this.purpose = purpose;
        this.expiresAt = expiresAt;
    }

    public String getTokenHash() { return tokenHash; }
    public Long getUserId() { return userId; }
    public String getPurpose() { return purpose; }
    public Instant getExpiresAt() { return expiresAt; }
    public Instant getUsedAt() { return usedAt; }
    public void setUsedAt(Instant usedAt) { this.usedAt = usedAt; }
}
