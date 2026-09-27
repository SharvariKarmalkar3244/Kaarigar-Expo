package com.kaarigarexpo.event_service.exception;

public class CapacityFullException
        extends RuntimeException {

    public CapacityFullException(String message) {
        super(message);
    }
}