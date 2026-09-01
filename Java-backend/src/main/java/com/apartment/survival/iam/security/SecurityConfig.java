package com.apartment.survival.iam.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.HandlerExceptionResolver;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.session.SessionRegistryImpl;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.context.DelegatingSecurityContextRepository;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.RequestAttributeSecurityContextRepository;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.web.csrf.CsrfTokenRequestHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final HandlerExceptionResolver handlerExceptionResolver;

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
    private List<String> allowedOrigins;

    public static final class SpaCsrfTokenRequestHandler implements CsrfTokenRequestHandler {
        private final CsrfTokenRequestHandler delegate = new CsrfTokenRequestAttributeHandler();

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
            this.delegate.handle(request, response, csrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            String headerValue = request.getHeader(csrfToken.getHeaderName());
            return (headerValue != null) ? headerValue : this.delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));
        http.csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
                .ignoringRequestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/csrf")
        );
        http.logout(logout -> logout.disable());
        http.formLogin(login -> login.disable());
        http.httpBasic(basic -> basic.disable());

        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED));

        http.exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) ->
                        handlerExceptionResolver.resolveException(request, response, null, authException))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                        handlerExceptionResolver.resolveException(request, response, null, accessDeniedException))
            );

        http.authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/actuator/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .anyRequest().authenticated()
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(allowedOrigins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-XSRF-TOKEN",
            "API-Version",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        configuration.setExposedHeaders(Arrays.asList("X-XSRF-TOKEN", "Set-Cookie"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SessionRegistry sessionRegistry() {
        return new SessionRegistryImpl();
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
        return new HttpSessionEventPublisher();
    }

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new DelegatingSecurityContextRepository(
                new RequestAttributeSecurityContextRepository(), // for temporary read/write cache
                new HttpSessionSecurityContextRepository()  // for HttpSession persistent storage
        );
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) {
        return config.getAuthenticationManager();
    }
}
