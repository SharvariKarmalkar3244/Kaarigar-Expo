package com.kaarigarexpo.event_service.dto;

import jakarta.validation.constraints.NotNull;

public class EventApplicationRequest {

    @NotNull
    private Long eventId;

    @NotNull
    private Long kaarigarId;

    private String remarks;

    public EventApplicationRequest() {
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getKaarigarId() {
        return kaarigarId;
    }

    public void setKaarigarId(Long kaarigarId) {
        this.kaarigarId = kaarigarId;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}