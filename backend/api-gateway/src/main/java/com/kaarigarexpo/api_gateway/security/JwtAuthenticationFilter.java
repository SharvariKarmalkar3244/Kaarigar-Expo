package com.kaarigarexpo.api_gateway.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            jakarta.servlet.FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();

        System.out.println("JWT Filter - Path: " + path);

        // ==========================================
        // PUBLIC AUTH ENDPOINTS
        // ==========================================

        if (
                path.startsWith("/api/auth/login")
                        || path.startsWith("/api/auth/register")
                        || path.startsWith("/api/auth/health")
        ) {

            filterChain.doFilter(request, response);
            return;
        }

        // ==========================================
        // GET AUTHORIZATION HEADER
        // ==========================================

        String header = request.getHeader("Authorization");

        System.out.println(
                "JWT Filter - Authorization header: "
                        + (
                        header != null
                                ? header.substring(
                                0,
                                Math.min(20, header.length())
                        ) + "..."
                                : "null"
                )
        );

        if (
                header == null
                        || !header.startsWith("Bearer ")
        ) {

            HttpServletRequest anonymousRequest = new HttpServletRequestWrapper(request) {
                private boolean isIdentityHeader(String name) {
                    return name.equalsIgnoreCase("X-User-Id")
                            || name.equalsIgnoreCase("X-User-Role")
                            || name.equalsIgnoreCase("X-User-Email");
                }

                @Override
                public String getHeader(String name) {
                    return isIdentityHeader(name) ? null : super.getHeader(name);
                }

                @Override
                public Enumeration<String> getHeaders(String name) {
                    return isIdentityHeader(name) ? Collections.emptyEnumeration() : super.getHeaders(name);
                }

                @Override
                public Enumeration<String> getHeaderNames() {
                    Set<String> names = new LinkedHashSet<>();
                    Enumeration<String> existing = super.getHeaderNames();
                    while (existing != null && existing.hasMoreElements()) {
                        String name = existing.nextElement();
                        if (!isIdentityHeader(name)) names.add(name);
                    }
                    return Collections.enumeration(names);
                }
            };

            filterChain.doFilter(anonymousRequest, response);
            return;
        }

        // ==========================================
        // EXTRACT TOKEN
        // ==========================================

        String token = header.substring(7);

        System.out.println(
                "JWT Filter - Token extracted, validating..."
        );

        // ==========================================
        // VALIDATE TOKEN
        // ==========================================

        if (!jwtService.isValid(token)) {

            System.out.println(
                    "JWT Filter - Token invalid"
            );

            response.setStatus(
                    HttpServletResponse.SC_UNAUTHORIZED
            );

            response.setContentType(
                    "application/json"
            );

            response.getWriter().write(
                    "{\"error\":\"Invalid or expired token\"}"
            );

            return;
        }

        // ==========================================
        // EXTRACT CLAIMS
        // ==========================================

        Claims claims =
                jwtService.extractClaims(token);

        Object userId =
                claims.get("userId");

        String role =
                claims.get("role", String.class);

        String email =
                claims.getSubject();

        System.out.println(
                "JWT Filter - Token valid. UserId: "
                        + userId
                        + ", Role: "
                        + role
                        + ", Email: "
                        + email
        );

        // ==========================================
        // CREATE TRUSTED HEADERS
        // ==========================================

        String trustedUserId =
                String.valueOf(userId);

        String trustedRole =
                role;

        String trustedEmail =
                email;

        System.out.println(
                "JWT Filter - Forwarding X-User-Id: "
                        + trustedUserId
        );

        System.out.println(
                "JWT Filter - Forwarding X-User-Role: "
                        + trustedRole
        );

        System.out.println(
                "JWT Filter - Forwarding X-User-Email: "
                        + trustedEmail
        );

        // ==========================================
        // WRAP REQUEST
        // ==========================================

        HttpServletRequest wrappedRequest =
                new HttpServletRequestWrapper(request) {

                    @Override
                    public String getHeader(String name) {

                        if (name.equalsIgnoreCase("X-User-Id")) {
                            return trustedUserId;
                        }

                        if (name.equalsIgnoreCase("X-User-Role")) {
                            return trustedRole;
                        }

                        if (name.equalsIgnoreCase("X-User-Email")) {
                            return trustedEmail;
                        }

                        return super.getHeader(name);
                    }

                    @Override
                    public Enumeration<String> getHeaders(String name) {

                        if (name.equalsIgnoreCase("X-User-Id")) {

                            return Collections.enumeration(
                                    Collections.singletonList(
                                            trustedUserId
                                    )
                            );
                        }

                        if (name.equalsIgnoreCase("X-User-Role")) {

                            return Collections.enumeration(
                                    Collections.singletonList(
                                            trustedRole
                                    )
                            );
                        }

                        if (name.equalsIgnoreCase("X-User-Email")) {

                            return Collections.enumeration(
                                    Collections.singletonList(
                                            trustedEmail
                                    )
                            );
                        }

                        return super.getHeaders(name);
                    }

                    @Override
                    public Enumeration<String> getHeaderNames() {

                        Set<String> headers =
                                new LinkedHashSet<>();

                        Enumeration<String> existingHeaders =
                                super.getHeaderNames();

                        if (existingHeaders != null) {

                            while (
                                    existingHeaders.hasMoreElements()
                            ) {

                                String headerName =
                                        existingHeaders.nextElement();

                                // Remove client-supplied identity headers
                                if (
                                        headerName.equalsIgnoreCase(
                                                "X-User-Id"
                                        )
                                                || headerName.equalsIgnoreCase(
                                                "X-User-Role"
                                        )
                                                || headerName.equalsIgnoreCase(
                                                "X-User-Email"
                                        )
                                ) {
                                    continue;
                                }

                                headers.add(headerName);
                            }
                        }

                        // Add trusted identity headers
                        headers.add("X-User-Id");
                        headers.add("X-User-Role");
                        headers.add("X-User-Email");

                        return Collections.enumeration(headers);
                    }
                };

        // ==========================================
        // CONTINUE REQUEST
        // ==========================================

        filterChain.doFilter(
                wrappedRequest,
                response
        );
    }
}
