package com.kaarigarexpo.auth_service.config;

import com.kaarigarexpo.auth_service.security.JwtAuthenticationFilter;
import com.kaarigarexpo.auth_service.security.GoogleOAuthSuccessHandler;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final GoogleOAuthSuccessHandler googleOAuthSuccessHandler;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            GoogleOAuthSuccessHandler googleOAuthSuccessHandler,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
        this.googleOAuthSuccessHandler = googleOAuthSuccessHandler;
        this.frontendUrl = frontendUrl.replaceAll("/$", "");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                // OAuth2 authorization state is kept in the HTTP session; API auth remains JWT-based.

                .authorizeHttpRequests(auth -> auth

                        // Public
                        .requestMatchers(
                                "/api/auth/register",
                                "/api/auth/login",
                                "/api/auth/verify-email",
                                "/api/auth/password-reset/**",
                                "/actuator/health/**",
                                "/api/auth/health",
                                "/oauth2/**",
                                "/login/oauth2/**"
                        ).permitAll()

                        // Service-to-service name lookup checks its shared secret in the controller.
                        .requestMatchers("/internal/accounts/**").permitAll()

                        // Admin
                        .requestMatchers(
                                "/api/admin/**"
                        ).hasRole("ADMIN")

                        // Authenticated users
                        .requestMatchers(
                                "/api/auth/me"
                        ).authenticated()

                        // Everything else
                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                )
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(googleOAuthSuccessHandler)
                        .failureHandler((request, response, exception) ->
                                response.sendRedirect(frontendUrl + "/register?oauth=failed")));

        return http.build();
    }
}
