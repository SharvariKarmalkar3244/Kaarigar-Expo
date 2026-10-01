package com.kaarigarexpo.kaarigar_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Bean
    public CircuitBreakerRegistry circuitBreakerRegistry() {
        CircuitBreakerConfig config = CircuitBreakerConfig.custom()
                .failureRateThreshold(50).minimumNumberOfCalls(5).slidingWindowSize(10)
                .waitDurationInOpenState(Duration.ofSeconds(20)).build();
        return CircuitBreakerRegistry.of(config);
    }

    @Bean
    public RestTemplate restTemplate(CircuitBreakerRegistry registry) {
        RestTemplate template = new RestTemplate();
        template.getInterceptors().add((request, body, execution) -> {
            String host = request.getURI().getHost() + ":" + request.getURI().getPort();
            try {
                return registry.circuitBreaker(host).executeCheckedSupplier(() -> execution.execute(request, body));
            } catch (java.io.IOException exception) {
                throw exception;
            } catch (Throwable exception) {
                throw new java.io.IOException("Downstream circuit is open or unavailable: " + host, exception);
            }
        });
        return template;
    }
}
