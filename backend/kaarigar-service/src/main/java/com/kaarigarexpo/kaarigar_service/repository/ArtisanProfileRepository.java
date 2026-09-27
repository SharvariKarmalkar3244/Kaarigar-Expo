package com.kaarigarexpo.kaarigar_service.repository;

import com.kaarigarexpo.kaarigar_service.entity.ArtisanProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ArtisanProfileRepository
        extends JpaRepository<ArtisanProfile, Long> {

    Optional<ArtisanProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}