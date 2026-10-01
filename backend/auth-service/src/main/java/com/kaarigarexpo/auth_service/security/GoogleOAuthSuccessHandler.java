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
import com.kaarigarexpo.auth_service.entity.Role;

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

        String googleSubject = principal.getAttribute("sub");
        String email = principal.getAttribute("email");
        if (googleSubject == null || googleSubject.isBlank() || email == null || email.isBlank()) {
            response.sendRedirect(frontendUrl + "/register?oauth=failed");
            return;
        }

        var oauthSession = request.getSession(false);
        String roleValue = oauthSession == null
                ? null
                : (String) oauthSession.getAttribute("google-registration-role");
        if (oauthSession != null) {
            oauthSession.removeAttribute("google-registration-role");
        }
        Role requestedRole = "KAARIGAR".equalsIgnoreCase(roleValue) ? Role.KAARIGAR : Role.VISITOR;

        LoginResponse session = authService.loginOrRegisterGoogle(
                googleSubject,
                email,
                principal.getAttribute("name"),
                requestedRole);
        response.sendRedirect(frontendUrl + "/oauth/callback#token=" + session.token());
    }
}
