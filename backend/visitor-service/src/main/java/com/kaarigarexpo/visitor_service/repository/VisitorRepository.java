package com.kaarigarexpo.visitor_service.repository;

import com.kaarigarexpo.visitor_service.entity.Visitor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VisitorRepository
        extends JpaRepository<Visitor, Long> {

    Optional<Visitor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}