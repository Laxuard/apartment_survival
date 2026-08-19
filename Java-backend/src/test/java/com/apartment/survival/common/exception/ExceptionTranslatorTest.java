package com.apartment.survival.common.exception;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.ConcurrencyFailureException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;

import com.apartment.survival.common.exception.type.BadRequestException;
import com.apartment.survival.common.exception.type.DuplicateResourceException;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;

@DisplayName("ExceptionTranslator Unit Tests")
class ExceptionTranslatorTest {

    private final ExceptionTranslator translator = new ExceptionTranslator();
    private static final String PATH = "/api/test";

    @Test
    @DisplayName("Should translate BaseException subclasses with appropriate HTTP statuses")
    void translate_BaseExceptions() {
        ProblemDetail notFound = translator.translate(new ResourceNotFoundException("Not found"), PATH);
        assertThat(notFound.getStatus()).isEqualTo(HttpStatus.NOT_FOUND.value());
        assertThat(notFound.getTitle()).isEqualTo("Resource Not Found");
        assertThat(notFound.getDetail()).isEqualTo("Not found");

        ProblemDetail badRequest = translator.translate(new BadRequestException("Invalid input"), PATH);
        assertThat(badRequest.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(badRequest.getTitle()).isEqualTo("Bad Request");

        ProblemDetail duplicate = translator.translate(new DuplicateResourceException("Already exists"), PATH);
        assertThat(duplicate.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(duplicate.getTitle()).isEqualTo("Duplicate Resource");
    }

    @Test
    @DisplayName("Should translate Security and Authentication exceptions")
    void translate_SecurityExceptions() {
        ProblemDetail badCreds = translator.translate(new BadCredentialsException("Bad creds"), PATH);
        assertThat(badCreds.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(badCreds.getDetail()).isEqualTo("Email or password is incorrect");

        ProblemDetail locked = translator.translate(new LockedException("Locked"), PATH);
        assertThat(locked.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED.value());
        assertThat(locked.getDetail()).contains("suspended");

        ProblemDetail accessDenied = translator.translate(new AccessDeniedException("Forbidden"), PATH);
        assertThat(accessDenied.getStatus()).isEqualTo(HttpStatus.FORBIDDEN.value());
        assertThat(accessDenied.getTitle()).isEqualTo("Forbidden");
    }

    @Test
    @DisplayName("Should translate Database Concurrency and DataIntegrity exceptions")
    void translate_DatabaseExceptions() {
        ProblemDetail concurrency = translator.translate(new ConcurrencyFailureException("Conflict"), PATH);
        assertThat(concurrency.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(concurrency.getTitle()).isEqualTo("Concurrency Conflict");

        ProblemDetail integrity = translator.translate(new DataIntegrityViolationException("Constraint violation"), PATH);
        assertThat(integrity.getStatus()).isEqualTo(HttpStatus.CONFLICT.value());
        assertThat(integrity.getTitle()).isEqualTo("Data Integrity Violation");
    }

    @Test
    @DisplayName("Should translate IllegalArgumentException to 400 Bad Request")
    void translate_IllegalArgumentException() {
        ProblemDetail illegalArg = translator.translate(new IllegalArgumentException("Illegal argument"), PATH);
        assertThat(illegalArg.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST.value());
        assertThat(illegalArg.getDetail()).isEqualTo("Illegal argument");
    }

    @Test
    @DisplayName("Should translate Unhandled General Exception to 500 Internal Server Error")
    void translate_GeneralException() {
        ProblemDetail general = translator.translate(new RuntimeException("Crash"), PATH);
        assertThat(general.getStatus()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR.value());
        assertThat(general.getDetail()).isEqualTo("An unexpected error occurred");
    }

    @Test
    @DisplayName("Should format error code titles and attach metadata correctly")
    void buildProblemDetail_MetadataFormatting() {
        ProblemDetail problem = translator.buildProblemDetail(
                HttpStatus.BAD_REQUEST,
                "custom-error-code",
                "Detailed message",
                PATH,
                Map.of("custom_key", "custom_val")
        );

        assertThat(problem.getTitle()).isEqualTo("Custom Error Code");
        assertThat(problem.getProperties()).containsKey("timestamp");
        assertThat(problem.getProperties().get("custom_key")).isEqualTo("custom_val");
    }
}
