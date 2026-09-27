package com.kaarigarexpo.event_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class InternalServiceFilter
        extends OncePerRequestFilter {

    @Value("${internal.service.secret}")
    private String internalSecret;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Protect only internal Event Service endpoints
        if (path.startsWith("/internal/events/")) {

            String secret =
                    request.getHeader("X-Internal-Secret");

            // Reject missing or incorrect secret
            if (
                    secret == null
                            ||
                            !secret.equals(internalSecret)
            ) {

                response.setStatus(
                        HttpServletResponse.SC_UNAUTHORIZED
                );

                response.setContentType(
                        "application/json"
                );

                response.getWriter().write(
                        "{\"error\":\"Unauthorized internal request\"}"
                );

                return;
            }
        }

        // Continue normally for valid requests
        // and for all non-internal endpoints
        filterChain.doFilter(
                request,
                response
        );
    }
}