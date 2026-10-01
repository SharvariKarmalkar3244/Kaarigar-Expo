package com.kaarigarexpo.auth_service.repository;

import com.kaarigarexpo.auth_service.entity.AuthActionToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AuthActionTokenRepository extends JpaRepository<AuthActionToken, String> {
    Optional<AuthActionToken> findByTokenHashAndPurposeAndUsedAtIsNull(String tokenHash, String purpose);
    void deleteByUserIdAndPurposeAndUsedAtIsNull(Long userId, String purpose);
}
