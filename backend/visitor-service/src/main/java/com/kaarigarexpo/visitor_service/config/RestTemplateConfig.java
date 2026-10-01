package com.kaarigarexpo.visitor_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
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
                return circuitBreaker.executeCheckedSupplier(() -> {
                    ClientHttpResponse response = execution.execute(request, body);
                    if (response.getStatusCode().is5xxServerError()) {
                        int status = response.getStatusCode().value();
                        response.close();
                        throw new java.io.IOException("Downstream service returned HTTP " + status + ": " + host);
                    }
                    return response;
                });
            } catch (CallNotPermittedException exception) {
                throw new java.io.IOException("Downstream circuit is open: " + host, exception);
            }
        });
        return template;
    }
}
