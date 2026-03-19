package com.group7.evr.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.Objects;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final @NonNull String[] allowedOrigins;

    public WebConfig(@Value("${app.cors.allowed-origins:http://localhost:5173}") String allowedOriginsProperty) {
        String[] normalizedOrigins = Arrays.stream(allowedOriginsProperty.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isEmpty())
                .toArray(String[]::new);
        this.allowedOrigins = normalizedOrigins.length == 0
                ? new String[]{"http://localhost:5173"}
                : Objects.requireNonNull(normalizedOrigins);
    }

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}


