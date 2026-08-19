package com.apartment.survival.common.exception;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import jakarta.servlet.http.HttpServletRequest;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import com.apartment.survival.common.exception.type.ResourceNotFoundException;

@DisplayName("GlobalExceptionHandler Unit Tests")
class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        ExceptionTranslator translator = new ExceptionTranslator();
        exceptionHandler = new GlobalExceptionHandler(translator);
        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    @DisplayName("Should handle BaseException subclasses")
    void handleBaseException() {
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleBaseException(
                new ResourceNotFoundException("Item not found"), request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getDetail()).isEqualTo("Item not found");
    }

    @Test
    @DisplayName("Should handle AuthenticationException")
    void handleAuthenticationException() {
        AuthenticationException ex = mock(AuthenticationException.class);
        when(ex.getMessage()).thenReturn("Auth failed");

        ResponseEntity<ProblemDetail> response = exceptionHandler.handleAuthenticationException(ex, request);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("Should handle AccessDeniedException")
    void handleAccessDeniedException() {
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleAccessDeniedException(
                new AccessDeniedException("Forbidden"), request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("Should handle ConcurrencyFailureException")
    void handleConcurrencyFailure() {
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleConcurrencyFailure(
                new ConcurrencyFailureException("Conflict"), request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should handle DataIntegrityViolationException")
    void handleDataIntegrityViolation() {
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleDataIntegrityViolation(
                new DataIntegrityViolationException("Unique constraint violation"), request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    @DisplayName("Should handle Unexpected Exception")
    void handleUnexpected() {
        ResponseEntity<ProblemDetail> response = exceptionHandler.handleUnexpected(
                new RuntimeException("Fatal error"), request
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
