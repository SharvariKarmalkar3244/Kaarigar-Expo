package com.kaarigarexpo.auth_service.service;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailDeliveryService {
    private static final System.Logger LOGGER = System.getLogger(EmailDeliveryService.class.getName());
    private final JavaMailSender mailSender;
    private final boolean enabled;
    private final String from;
    private final String frontendUrl;

    public EmailDeliveryService(ObjectProvider<JavaMailSender> mailSender,
            @Value("${app.email.enabled:false}") boolean enabled,
            @Value("${app.email.from:no-reply@kaarigar-expo.local}") String from,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl) {
        this.mailSender = mailSender.getIfAvailable();
        this.enabled = enabled;
        this.from = from;
        this.frontendUrl = frontendUrl.replaceAll("/$", "");
    }

    public String sendActionLink(String recipient, String purpose, String token) {
        String path = "VERIFY_EMAIL".equals(purpose) ? "/verify-email" : "/reset-password";
        String url = frontendUrl + path + "?token=" + token;
        String subject = "VERIFY_EMAIL".equals(purpose) ? "Verify your Kaarigar Expo email" : "Reset your Kaarigar Expo password";
        String body = "Use this one-time link within 30 minutes:\n\n" + url + "\n\nIf you did not request this, you can ignore this message.";
        if (!enabled || mailSender == null) {
            LOGGER.log(System.Logger.Level.WARNING, "Email is disabled; development action link: " + url);
        } else {
            deliver(recipient, subject, body);
        }
        return url;
    }

    public void send(String recipient, String subject, String body) {
        deliver(recipient, subject, body);
    }

    private void deliver(String recipient, String subject, String body) {
        if (!enabled || mailSender == null) {
            LOGGER.log(System.Logger.Level.WARNING, "Email is disabled. Configure app.email.enabled and SMTP settings to deliver messages.");
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(recipient);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
