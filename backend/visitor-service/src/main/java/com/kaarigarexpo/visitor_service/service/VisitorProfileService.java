package com.kaarigarexpo.visitor_service.service;

import com.kaarigarexpo.visitor_service.dto.VisitorRequest;
import com.kaarigarexpo.visitor_service.dto.VisitorResponse;
import com.kaarigarexpo.visitor_service.entity.Visitor;
import com.kaarigarexpo.visitor_service.repository.VisitorRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class VisitorProfileService {

    private final VisitorRepository visitorRepository;

    public VisitorProfileService(
            VisitorRepository visitorRepository
    ) {
        this.visitorRepository = visitorRepository;
    }

    public VisitorResponse createProfile(
            Long userId,
            VisitorRequest request
    ) {

        if (visitorRepository.existsByUserId(userId)) {
            throw new RuntimeException(
                    "Visitor profile already exists"
            );
        }

        Visitor visitor = new Visitor();

        visitor.setUserId(userId);
        visitor.setName(request.name());
        visitor.setEmail(request.email());
        visitor.setPhone(request.phone());
        visitor.setPhotoUrl(request.photoUrl());

        return mapToResponse(
                visitorRepository.save(visitor)
        );
    }

    public VisitorResponse getProfile(Long userId) {

        Visitor visitor =
                visitorRepository.findByUserId(userId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Visitor profile not found"
                                )
                        );

        return mapToResponse(visitor);
    }

    public VisitorResponse updateProfile(Long userId, VisitorRequest request) {
        Visitor visitor = visitorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Visitor profile not found"));
        visitor.setName(request.name());
        visitor.setEmail(request.email());
        visitor.setPhone(request.phone());
        visitor.setPhotoUrl(request.photoUrl());
        return mapToResponse(visitorRepository.save(visitor));
    }

    private VisitorResponse mapToResponse(
            Visitor visitor
    ) {

        return new VisitorResponse(
                visitor.getId(),
                visitor.getUserId(),
                visitor.getName(),
                visitor.getEmail(),
                visitor.getPhone(),
                visitor.getCreatedAt(),
                visitor.getPhotoUrl()
        );
    }
}
