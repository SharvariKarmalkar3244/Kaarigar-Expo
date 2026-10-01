package com.kaarigarexpo.kaarigar_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.http.client.ClientHttpResponse;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import io.github.resilience4j.circuitbreaker.CircuitBreakerConfig;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
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
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(3_000);
        requestFactory.setReadTimeout(8_000);
        RestTemplate template = new RestTemplate(requestFactory);
        template.getInterceptors().add((request, body, execution) -> {
            String host = request.getURI().getHost() + ":" + request.getURI().getPort();
            var circuitBreaker = registry.circuitBreaker(host);
            try {
                return circuitBreaker.executeSupplier(() -> {
                    final ClientHttpResponse response;
                    try {
                        response = execution.execute(request, body);
                    } catch (java.io.IOException exception) {
                        throw new ResourceAccessException("Downstream request failed: " + host, exception);
                    }
                    final int status;
                    try {
                        if (!response.getStatusCode().is5xxServerError()) {
                            return response;
                        }
                        status = response.getStatusCode().value();
                    } catch (java.io.IOException exception) {
                        response.close();
                        throw new ResourceAccessException("Could not read downstream response: " + host, exception);
                    }
                    response.close();
                    throw new ResourceAccessException(
                            "Downstream service returned HTTP " + status + ": " + host);
                });
            } catch (CallNotPermittedException exception) {
                throw new ResourceAccessException("Downstream circuit is open: " + host,
                        new java.io.IOException("Circuit breaker rejected the request", exception));
            }
        });
        return template;
    }
}
