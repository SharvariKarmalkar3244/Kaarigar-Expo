package com.kaarigarexpo.auth_service.service;

import com.kaarigarexpo.auth_service.dto.LoginRequest;
import com.kaarigarexpo.auth_service.dto.LoginResponse;
import com.kaarigarexpo.auth_service.dto.RegisterRequest;
import com.kaarigarexpo.auth_service.dto.RegisterResponse;
import com.kaarigarexpo.auth_service.entity.AuthActionToken;
import com.kaarigarexpo.auth_service.entity.User;
import com.kaarigarexpo.auth_service.repository.AuthActionTokenRepository;
import com.kaarigarexpo.auth_service.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import com.kaarigarexpo.auth_service.entity.Role;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthActionTokenRepository actionTokenRepository;
    private final EmailDeliveryService emailDeliveryService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthActionTokenRepository actionTokenRepository,
            EmailDeliveryService emailDeliveryService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.actionTokenRepository = actionTokenRepository;
        this.emailDeliveryService = emailDeliveryService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already registered");
        }

        String hashedPassword =
                passwordEncoder.encode(request.password());

        User user = new User(
                request.name(),
                request.email(),
                hashedPassword,
                request.role()
        );

        user.setEmailVerified(false);
        User savedUser = userRepository.save(user);
        issueActionToken(savedUser, "VERIFY_EMAIL");

        return new RegisterResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "Registration successful"
        );
    }

    public LoginResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.email())
                .orElseThrow(() ->
                        new RuntimeException("Invalid email or password")
                );

        if (user.getPassword() == null || !passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {
            throw new RuntimeException(
                    "Invalid email or password"
            );
        }

        String token = jwtService.generateToken(user);

        return new LoginResponse(
                token,
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole().name(),
                user.isEmailVerified()
        );
    }

    @Transactional
    public LoginResponse loginOrRegisterGoogle(String googleSubject, String email, String name) {
        String normalizedEmail = email.trim().toLowerCase();
        User user = userRepository.findByGoogleSubject(googleSubject)
                .orElseGet(() -> userRepository.findByEmail(normalizedEmail)
                        .map(existing -> {
                            if (existing.getGoogleSubject() != null
                                    && !existing.getGoogleSubject().equals(googleSubject)) {
                                throw new IllegalArgumentException("This email is linked to another Google account");
                            }
                            existing.setGoogleSubject(googleSubject);
                            return userRepository.save(existing);
                        })
                        .orElseGet(() -> userRepository.save(new User(
                                name == null || name.isBlank() ? normalizedEmail : name,
                                normalizedEmail,
                                null,
                                Role.VISITOR,
                                googleSubject
                        ))));
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getName(), user.getEmail(), user.getRole().name(), user.isEmailVerified());
    }

    public String getDisplayName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getName)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
    }

    @Transactional
    public void verifyEmail(String token) {
        AuthActionToken action = consumeActionToken(token, "VERIFY_EMAIL");
        User user = userRepository.findById(action.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        userRepository.findByEmail(email.trim().toLowerCase())
                .filter(user -> user.getPassword() != null)
                .ifPresent(user -> issueActionToken(user, "RESET_PASSWORD"));
    }

    @Transactional
    public void resendVerification(String email) {
        userRepository.findByEmail(email.trim().toLowerCase())
                .filter(user -> !user.isEmailVerified())
                .ifPresent(user -> issueActionToken(user, "VERIFY_EMAIL"));
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        AuthActionToken action = consumeActionToken(token, "RESET_PASSWORD");
        User user = userRepository.findById(action.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    private void issueActionToken(User user, String purpose) {
        actionTokenRepository.deleteByUserIdAndPurposeAndUsedAtIsNull(user.getId(), purpose);
        String rawToken = java.util.UUID.randomUUID() + java.util.UUID.randomUUID().toString().replace("-", "");
        actionTokenRepository.save(new AuthActionToken(hashToken(rawToken), user.getId(), purpose,
                Instant.now().plus(30, ChronoUnit.MINUTES)));
        emailDeliveryService.sendActionLink(user.getEmail(), purpose, rawToken);
    }

    private AuthActionToken consumeActionToken(String token, String purpose) {
        AuthActionToken action = actionTokenRepository.findByTokenHashAndPurposeAndUsedAtIsNull(hashToken(token), purpose)
                .filter(value -> value.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Link is invalid or expired"));
        action.setUsedAt(Instant.now());
        actionTokenRepository.save(action);
        return action;
    }

    private String hashToken(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
