package com.kaarigarexpo.auth_service.security;

import com.kaarigarexpo.auth_service.dto.LoginResponse;
import com.kaarigarexpo.auth_service.service.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class GoogleOAuthSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthService authService;
    private final String frontendUrl;

    public GoogleOAuthSuccessHandler(AuthService authService,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.authService = authService;
        this.frontendUrl = frontendUrl.replaceAll("/$", "");
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User principal = ((OAuth2AuthenticationToken) authentication).getPrincipal();
        Object verified = principal.getAttribute("email_verified");
        if (!(Boolean.TRUE.equals(verified) || "true".equalsIgnoreCase(String.valueOf(verified)))) {
            response.sendRedirect(frontendUrl + "/register?oauth=unverified-email");
            return;
        }

        LoginResponse session = authService.loginOrRegisterGoogle(
                principal.getAttribute("sub"),
                principal.getAttribute("email"),
                principal.getAttribute("name"));
        response.sendRedirect(frontendUrl + "/oauth/callback#token=" + session.token());
    }
}
