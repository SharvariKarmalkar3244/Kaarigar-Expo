package com.kaarigarexpo.event_service.service;

import com.kaarigarexpo.event_service.entity.AuditLog;
import com.kaarigarexpo.event_service.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {
    private final AuditLogRepository repository;
    public AuditLogService(AuditLogRepository repository) { this.repository = repository; }
    public void record(String action, String type, Long id, String actor, String details) {
        repository.save(new AuditLog(action, type, id, actor, details));
    }
    public Page<AuditLog> recent(int page, int size) {
        return repository.findAllByOrderByOccurredAtDesc(PageRequest.of(Math.max(0, page), Math.min(Math.max(1, size), 100), Sort.unsorted()));
    }
}
